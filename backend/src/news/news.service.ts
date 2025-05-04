import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GenerateNewsDto } from './dto/generateNews.dto';
import { StarNewsDto } from './dto/starNews.dto';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { NewsGroup, NewsGroupDocument } from './schemas/newsGroup.schema';
import { Model } from 'mongoose';
import { NewsEntry, NewsEntryDocument } from './schemas/newEntry.schema';
import { StarNewsMetaData } from './dto/starNewsMetaData.dto';
import { TitleMetaData } from './dto/titleMetaData.dto';

@Injectable()
export class NewsService {
  client = new OpenAI({
    baseURL: process.env.API_URL,
    apiKey: process.env.API_KEY,
    timeout: 30000,
  });
  constructor(
    @InjectModel(NewsGroup.name)
    private newsGroupModel: Model<NewsGroupDocument>,
    @InjectModel(NewsEntry.name)
    private newsEntryModel: Model<NewsEntryDocument>,
  ) {}

  async generateNews(dto: GenerateNewsDto): Promise<string> {
    const prompt = this.buildPrompt(dto);
    return await this.generate(prompt);
  }

  async saveNews(
    dto: GenerateNewsDto,
    content: string,
    userId: string,
    generateAt: Date,
  ) {
    return this.newsEntryModel.create({
      ...dto,
      content: content,
      generateAt: generateAt,
      userId: userId,
      absoluteStart: dto.absoluteStart ? new Date(dto.absoluteStart) : null,
      absoluteEnd: dto.absoluteEnd ? new Date(dto.absoluteEnd) : null,
    });
  }

  async getParamsById(
    newsId: string,
    userId: string,
  ): Promise<GenerateNewsDto> {
    const news = await this.newsEntryModel.findById(newsId).lean();

    if (!news || (news.userId && news.userId !== userId)) {
      throw new NotFoundException('News not found or access denied');
    }

    return {
      ...news,
      absoluteStart: news.absoluteStart?.toISOString(),
      absoluteEnd: news.absoluteEnd?.toISOString(),
    };
  }

  async starNews(dto: StarNewsDto, userId: string) {
    const entry = await this.newsEntryModel.findOne({
      _id: dto.newsId,
      userId,
    });
    if (!entry) {
      throw new NotFoundException('找不到对应的新闻条目');
    }
    const existing = await this.newsGroupModel.findOne({
      userId: userId,
      title: dto.title,
    });
    if (existing) {
      throw new ConflictException('标题已存在');
    }

    entry.starred = true;
    entry.groupTitle = dto.title;
    await entry.save();

    try {
      await this.newsGroupModel.create({
        keyword: entry.keyword,
        timeMode: entry.timeMode,
        relativeAmount: entry.relativeAmount,
        relativeUnit: entry.relativeUnit,
        detailLevel: entry.detailLevel,
        style: entry.style,
        focus: entry.focus,
        userId: userId,
        title: dto.title,
        autoUpdate: dto.autoUpdate,
        updateFreqAmount: dto.updateFreqAmount,
        updateFreqType: dto.updateFreqType,
        lastUpdatedAt: new Date(),
        lastCheckedAt: new Date(),
        contents: entry._id ? [entry._id] : [],
      });
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async unstarNews(newsId: string, userId: string) {
    const entry = await this.newsEntryModel.findOneAndUpdate(
      { _id: newsId, userId },
      { $set: { starred: false, groupTitle: undefined } },
      { new: true },
    );

    if (!entry || !entry.groupTitle) {
      throw new NotFoundException('找不到对应的新闻条目');
    }

    await this.deleteGroup(entry.groupTitle, userId);
    return true;
  }

  async deleteGroup(title: string, userId: string) {
    const group = await this.newsGroupModel.findOneAndDelete({
      title: title,
      userId: userId,
    });
    if (!group) {
      throw new NotFoundException('找不到对应的新闻历史');
    }

    await this.newsEntryModel.updateMany(
      { _id: { $in: group.contents } },
      { $unset: { groupTitle: undefined } },
    );
  }

  async findAllByUser(userId: string) {
    return this.newsEntryModel
      .find({ userId }, { _id: 1, content: 1, generateAt: 1, starred: 1 })
      .lean();
  }

  async findTitlesByUser(userId: string) {
    const groups = await this.newsGroupModel
      .find(
        { userId: userId },
        {
          _id: 1,
          title: 1,
          autoUpdate: 1,
          updateFreqAmount: 1,
          updateFreqType: 1,
          lastUpdatedAt: 1,
        },
      )
      .lean();
    return groups.map(({ _id, ...rest }) => ({
      titleId: _id,
      ...rest,
    }));
  }

  async findStarredByUser(userId: string) {
    return this.newsGroupModel.find({ userId: userId });
  }

  async getNewsByTitleId(titleId: string, userId: string) {
    const group = await this.newsGroupModel.findOne({
      _id: titleId,
      userId: userId,
    });

    if (!group) {
      throw new NotFoundException('找不到对应的新闻历史');
    }

    return await this.newsEntryModel
      .find(
        { _id: { $in: group.contents } },
        { _id: 1, content: 1, generateAt: 1, starred: 1 },
      )
      .lean();
  }

  async changeTitle(titleMetaData: TitleMetaData, userId: string) {
    const { titleId, title, autoUpdate, updateFreqAmount, updateFreqType } =
      titleMetaData;

    // 开启MongoDB事务
    const session = await this.newsGroupModel.db.startSession();
    session.startTransaction();

    try {
      const group = await this.newsGroupModel
        .findOneAndUpdate(
          { _id: titleId, userId },
          {
            $set: {
              title: title,
              autoUpdate: autoUpdate,
              updateFreqAmount: updateFreqAmount,
              updateFreqType: updateFreqType,
            },
          },
          { session, new: true }, // 返回更新后的文档
        )
        .exec();

      if (!group) {
        throw new NotFoundException('找不到对应的新闻历史');
      }

      if (group.title !== title) {
        await this.newsEntryModel.updateMany(
          { _id: { $in: group.contents } },
          { $set: { groupTitle: title } },
          { session },
        );
      }

      // 提交事务
      await session.commitTransaction();
      return { ...titleMetaData };
    } catch (error) {
      // 出错时回滚
      await session.abortTransaction();
      throw new InternalServerErrorException('更新失败,', error);
    } finally {
      await session.endSession();
    }
  }

  private buildPrompt(dto: GenerateNewsDto): string {
    const {
      keyword,
      timeMode,
      relativeAmount,
      relativeUnit,
      absoluteStart,
      absoluteEnd,
      detailLevel,
      focus,
      style,
    } = dto;

    const curDate = new Date().toDateString();

    return (
      `请根据以下条件生成一篇新闻来龙去脉概述：

      关键词：${keyword}
      时间范围：` +
      (timeMode === 'relative'
        ? `${curDate}的${relativeAmount} ${relativeUnit} 前`
        : `从${absoluteStart}到${absoluteEnd}`) +
      `详细程度：${detailLevel}字
      风格：${style}
      ${focus ? `重点关注：${focus}` : ''}

      请以连贯自然的语言描述该事件的起因、发展和结果，长度大约控制在 ${detailLevel} 字左右。`
    );
  }

  private async generate(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 返回了空内容');
    }

    return content;
  }
}
