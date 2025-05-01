import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NewsService } from '../news.service';
import { CronJob } from 'cron';
import { NewsGroup, NewsGroupDocument } from '../schemas/newsGroup.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { NewsEntry, NewsEntryDocument } from '../schemas/newEntry.schema';
import { GenerateNewsDto } from '../dto/generateNews.dto';

@Injectable()
export class NewsScheduler {
  constructor(
    private newsService: NewsService,
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(NewsGroup.name)
    private newsGroupModel: Model<NewsGroupDocument>,
    @InjectModel(NewsEntry.name)
    private newsEntryModel: Model<NewsEntryDocument>,
  ) {}

  async initAllScheduledJobs() {
    const autoGroups = await this.newsGroupModel.find({ autoUpdate: true });
    for (const group of autoGroups) {
      try {
        await this.scheduleNewsJob(group);
      } catch (error) {
        console.error(
          `Failed to schedule job for group ${group.title}:`,
          error,
        );
      }
    }
  }

  // 动态注册定时任务
  async scheduleNewsJob(group: NewsGroup) {
    // const autoGroups = await this.newsGroupModel.find({ autoUpdate: true });
    const {
      keyword,
      detailLevel,
      timeRangeType,
      focus,
      style,
      relativeAmount,
      relativeUnit,
      updateFreqAmount,
      updateFreqType,
      title,
      userId,
    } = group;

    const cronTime = this.convertToCron(updateFreqAmount, updateFreqType);
    const job = new CronJob(cronTime, async () => {
      if (!relativeAmount || !relativeUnit) return;
      // 构建新的时间范围
      const endDate = dayjs();
      const startDate = endDate.subtract(
        relativeAmount,
        //类型断言验证
        relativeUnit as dayjs.ManipulateType,
      );
      //连接新闻api查询 TODO
      const hasNew = await this.newsService.checkForNewArticles(
        keyword,
        startDate,
        endDate,
      );

      if (hasNew) {
        const dto: GenerateNewsDto = {
          keyword: keyword,
          timeRangeType: timeRangeType,
          relativeAmount: relativeAmount,
          relativeUnit: relativeUnit,
          detailLevel: detailLevel,
          focus: focus,
          style: style,
        };

        const generated = await this.newsService.generateNews(dto);

        const entry = await this.newsService.saveNews(dto, generated, userId);
        entry.groupTitle = title;

        group.contents.push(entry._id as mongoose.Schema.Types.ObjectId);
        group.lastUpdatedAt = new Date();
      }
    });

    group.lastCheckedAt = new Date();
    await group.save();

    this.schedulerRegistry.addCronJob(`news-update-${title}`, job);
    job.start();
  }

  // 将频率转换为 cron 表达式
  convertToCron(amount?: number, type?: string): string {
    if (type === 'second') return `/${amount} * * * * *`;
    if (type === 'minute') return `*/${amount} * * * *`;
    if (type === 'hour') return `0 */${amount} * * *`;
    if (type === 'date') return `0 0 */${amount} * *`;
    if (type === 'month') return `0 0 0 */${amount} *`;
    return `* * * * *`; // 默认实时更新
  }
}
