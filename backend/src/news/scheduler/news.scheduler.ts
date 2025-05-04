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
    const {
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
    } = group;

    if (!updateFreqAmount || !updateFreqType) return;
    const cronTime = this.convertToCron(
      lastUpdatedAt,
      updateFreqAmount,
      updateFreqType,
    );
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
      // const hasNew = await this.newsService.checkForNewArticles(
      //   keyword,
      //   startDate,
      //   endDate,
      // );
      const hasNew = true;
      if (hasNew) {
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
      }
    });

    group.lastCheckedAt = new Date();
    await group.save();

    this.schedulerRegistry.addCronJob(`news-update-${title}`, job);
    job.start();
  }

  // 将频率转换为 cron 表达式
  convertToCron(lastUpdatedAt: Date, amount: number, type: string): string {
    const nextDate = lastUpdatedAt;

    switch (type) {
      case 'second':
        nextDate.setSeconds(nextDate.getSeconds() + amount);
        break;
      case 'minute':
        nextDate.setMinutes(nextDate.getMinutes() + amount);
        break;
      case 'hour':
        nextDate.setHours(nextDate.getHours() + amount);
        break;
      case 'date':
        nextDate.setDate(nextDate.getDate() + amount);
        break;
      case 'month':
        nextDate.setMonth(nextDate.getMonth() + amount);
        break;
      default:
        throw new Error('Invalid type');
    }

    const second = nextDate.getSeconds();
    const minute = nextDate.getMinutes();
    const hour = nextDate.getHours();
    const day = nextDate.getDate();
    const month = nextDate.getMonth() + 1;

    // Cron format: second minute hour day month weekday
    return `${second} ${minute} ${hour} ${day} ${month} *`;
  }
}
