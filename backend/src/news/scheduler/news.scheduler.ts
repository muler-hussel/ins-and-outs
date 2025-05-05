import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NewsService } from '../news.service';
import { NewsGroup, NewsGroupDocument } from '../schemas/newsGroup.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GenerateNewsDto } from '../dto/generateNews.dto';
import { SubResolver } from '../newsSub.resolver';

@Injectable()
export class NewsScheduler {
  constructor(
    private newsService: NewsService,
    private schedulerRegistry: SchedulerRegistry,
    private subResovler: SubResolver,
    @InjectModel(NewsGroup.name)
    private newsGroupModel: Model<NewsGroupDocument>,
  ) {}

  async initAllScheduledJobs() {
    const autoGroups = await this.newsGroupModel.find({ autoUpdate: true });
    for (const group of autoGroups) {
      try {
        this.scheduleNewsJob(group);
      } catch (error) {
        console.error(
          `Failed to schedule job for group ${group.title}:`,
          error,
        );
      }
    }
  }

  // 动态注册定时任务
  scheduleNewsJob(group: NewsGroup) {
    const {
      _id,
      keyword,
      detailLevel,
      timeMode,
      focus,
      style,
      relativeAmount,
      relativeUnit,
      updateFreqAmount,
      updateFreqType,
      title,
      userId,
      lastUpdatedAt,
      // 其他参数...
    } = group;
    const jobKey = `news-update-${_id as string}`;
    if (!updateFreqAmount || !updateFreqType || !lastUpdatedAt) return;

    //修正时间
    const intervalMs = this.getIntervalMs(updateFreqAmount, updateFreqType);
    const now = new Date();
    const last = new Date(lastUpdatedAt);
    const elapsed = now.getTime() - last.getTime();
    const delay = intervalMs - (elapsed % intervalMs);

    const dto: GenerateNewsDto = {
      keyword: keyword,
      timeMode: timeMode,
      relativeAmount: relativeAmount,
      relativeUnit: relativeUnit,
      detailLevel: detailLevel,
      focus: focus,
      style: style,
      startPicker: 'date',
      endPicker: 'date',
    };

    const scheduleNext = () => {
      console.log(delay);
      const timeoutRef = setTimeout(() => {
        void (async () => {
          try {
            const generated = await this.newsService.generateNews(dto);

            const entry = await this.newsService.saveNews(
              dto,
              generated,
              userId,
              new Date(),
            );
            entry.groupTitle = title;

            group.contents.push(entry._id as mongoose.Schema.Types.ObjectId);
            group.lastUpdatedAt = new Date();
            await group.save();

            const news = {
              _id: entry._id as string,
              content: generated,
              generateAt: entry.generateAt.toISOString(),
              starred: entry.starred,
            };
            await this.subResovler.notifyUpdate(news, userId, _id as string);
            scheduleNext();
          } catch (error) {
            console.error('定时任务执行出错:', error);
          }
        })();
      }, delay);
      this.schedulerRegistry.addTimeout(jobKey, timeoutRef);
    };

    if (this.schedulerRegistry.doesExist('timeout', jobKey)) {
      this.schedulerRegistry.deleteTimeout(jobKey);
    }

    scheduleNext();
  }

  rescheduleNewsJob(group: NewsGroup) {
    const jobKey = `news-update-${group._id as string}`;

    if (this.schedulerRegistry.doesExist('timeout', jobKey)) {
      this.schedulerRegistry.deleteTimeout(jobKey);
    }

    if (group.autoUpdate && group.updateFreqAmount && group.updateFreqType) {
      this.scheduleNewsJob(group); // 重启任务
    }
  }

  private getIntervalMs(amount: number, type: string): number {
    const map = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      date: 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };
    return amount * (map[type] || 60 * 1000); // 默认1分钟
  }
}
