import { Injectable, NotFoundException } from '@nestjs/common';
import { GenerateNewsDto } from './dto/generateNews.dto';
import { StarNewsDto } from './dto/starNews.dto';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { NewsGroup, NewsGroupDocument } from './schemas/newsGroup.schema';
import { Model } from 'mongoose';
import { NewsEntry, NewsEntryDocument } from './schemas/newEntry.schema';

@Injectable()
export class NewsService {
  client = new OpenAI();
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

  async saveNews(dto: GenerateNewsDto, content: string, userId: string) {
    return this.newsEntryModel.create({
      ...dto,
      content: content,
      generateAt: new Date(),
      userId: userId,
    });
  }

  async starNews(dto: StarNewsDto, userId: string) {
    const entry = await this.newsEntryModel.findOne({
      _id: dto.newsId,
      userId,
    });

    if (!entry) {
      throw new NotFoundException('找不到对应的新闻条目');
    }

    entry.starred = true;
    return this.newsGroupModel.create({
      ...entry,
      title: dto.title,
      autoUpdate: dto.autoUpdate,
      updateFreqAmount: dto.updateFreqAmount,
      updateFreqType: dto.updateFreqType,
      lastUpdatedAt: new Date(),
      lastCheckedAt: new Date(),
      content: entry._id ? [entry._id] : [],
    });
  }

  async unstarNews(newsId: string, userId: string) {
    const entry = await this.newsEntryModel.findOne({
      _id: newsId,
      userId,
    });

    if (!entry) {
      throw new NotFoundException('找不到对应的新闻条目');
    }
    entry.starred = false;

    if (!entry.groupTitle) return;
    await this.deleteGroup(entry.groupTitle, userId);
  }

  async deleteGroup(title: string, userId: string) {
    const group = await this.newsGroupModel.findOne({
      title: title,
      userId: userId,
    });
    if (!group) {
      throw new NotFoundException('找不到对应的新闻历史');
    }

    for (const contentId of group.contents) {
      const entry = await this.newsEntryModel.findOne({ _id: contentId });
      if (!entry) {
        continue;
      }
      entry.groupTitle = undefined;
    }
    group.deleteOne();
  }

  async findAllByUser(userId: string) {
    return this.newsEntryModel.find({ userId: userId });
  }

  async findStarredByUser(userId: string) {
    return this.newsGroupModel.find({ userId: userId });
  }

  private buildPrompt(dto: GenerateNewsDto): string {
    const {
      keyword,
      timeRangeType,
      relativeAmount,
      relativeUnit,
      absoluteStart,
      absoluteEnd,
      detailLevel,
      focus,
      style,
    } = dto;

    return (
      `请根据以下条件生成一篇新闻来龙去脉概述：

      关键词：${keyword}
      时间范围：` +
      (timeRangeType === 'relative'
        ? `${relativeAmount} ${relativeUnit} 前`
        : `从${absoluteStart}到${absoluteEnd}`) +
      `详细程度：${detailLevel}（数值越大越详细）
      风格：${style}
      ${focus ? `重点关注：${focus}` : ''}

      请以连贯自然的语言描述该事件的起因、发展和结果，长度大约控制在 ${detailLevel} 字左右。`
    );
  }

  private async generate(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: 'gpt-3.5-turbo',
      input: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return response.output_text;
  }
}
