import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StarNewsDto } from './dto/starNews.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NewsGroup, NewsGroupDocument } from './schemas/newsGroup.schema';
import { Model } from 'mongoose';
import { NewsEntry, NewsEntryDocument } from './schemas/newEntry.schema';
import { TitleMetaData } from './dto/titleMetaData.dto';
import { NewsScheduler } from './scheduler/news.scheduler';

@Injectable()
export class NewsGroupService {
  constructor(
    private newsScheduler: NewsScheduler,
    @InjectModel(NewsGroup.name)
    private newsGroupModel: Model<NewsGroupDocument>,
    @InjectModel(NewsEntry.name)
    private newsEntryModel: Model<NewsEntryDocument>,
  ) {}

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
      const group = await this.newsGroupModel.create({
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

      if (dto.autoUpdate) {
        this.newsScheduler.rescheduleNewsJob(group);
      }
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

    if (group.autoUpdate) {
      this.newsScheduler.rescheduleNewsJob(group);
    }
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
          relativeAmount: 1,
          relativeUnit: 1,
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
    const {
      titleId,
      title,
      autoUpdate,
      updateFreqAmount,
      updateFreqType,
      relativeAmount,
      relativeUnit,
    } = titleMetaData;

    // 开启MongoDB事务
    const session = await this.newsGroupModel.db.startSession();
    session.startTransaction();

    try {
      const oldGroup = await this.newsGroupModel
        .findOne({ _id: titleId, userId })
        .session(session);

      const newGroup = await this.newsGroupModel
        .findOneAndUpdate(
          { _id: titleId, userId },
          {
            $set: {
              title,
              autoUpdate,
              updateFreqAmount,
              updateFreqType,
              relativeAmount,
              relativeUnit,
            },
          },
          { session, new: true },
        )
        .exec();

      if (!newGroup || !oldGroup) {
        throw new NotFoundException('找不到对应的新闻历史');
      }

      if (oldGroup.title !== title) {
        await this.newsEntryModel.updateMany(
          { _id: { $in: newGroup.contents } },
          { $set: { groupTitle: title } },
          { session },
        );
      }

      if (this.schedualChanged(titleMetaData, oldGroup)) {
        this.newsScheduler.rescheduleNewsJob(newGroup);
      }

      // 提交事务
      await session.commitTransaction();
      return { ...titleMetaData };
    } catch (error) {
      // 出错时回滚
      await session.abortTransaction();
      throw new InternalServerErrorException(`更新失败: ${error}`);
    } finally {
      await session.endSession();
    }
  }

  private schedualChanged(titleMetaData: TitleMetaData, group: NewsGroup) {
    return (
      titleMetaData.autoUpdate !== group.autoUpdate ||
      titleMetaData.updateFreqAmount !== group.updateFreqAmount ||
      titleMetaData.updateFreqType !== group.updateFreqType ||
      titleMetaData.relativeAmount !== group.relativeAmount ||
      titleMetaData.relativeUnit !== group.relativeUnit
    );
  }
}
