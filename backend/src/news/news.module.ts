import { Module, OnModuleInit } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsScheduler } from './scheduler/news.scheduler';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsGroup, NewsGroupSchema } from './schemas/newsGroup.schema';
import { NewsResolver } from './news.resolver';
import { NewsEntry, NewsEntrySchema } from './schemas/newEntry.schema';
import { PubSub } from 'graphql-subscriptions';
import { NewsController } from './news.controller';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: NewsGroup.name, schema: NewsGroupSchema },
      { name: NewsEntry.name, schema: NewsEntrySchema },
    ]),
  ],
  providers: [
    NewsService,
    NewsScheduler,
    NewsResolver,
    {
      provide: 'PUB_SUB', // 令牌名称必须与注入时一致
      useValue: new PubSub(), // 直接提供实例
    },
  ],
  controllers: [NewsController],
})

//每次启动都调用自动更新
export class NewsModule implements OnModuleInit {
  constructor(private readonly scheduler: NewsScheduler) {}

  async onModuleInit() {
    await this.scheduler.initAllScheduledJobs();
  }
}
