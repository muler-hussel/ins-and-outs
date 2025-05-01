// news.resolver.ts
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { NewsType } from './newsType.enum';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => NewsType)
export class NewsResolver {
  constructor(
    private readonly newsService: NewsService,
    private pubSub: PubSub,
  ) {}

  @Query(() => [NewsType])
  async getAllNews(@Args('userId') userId: string) {
    return this.newsService.findAllByUser(userId);
  }

  @Query(() => [NewsType])
  async getStarredNews(@Args('userId') userId: string) {
    return this.newsService.findStarredByUser(userId);
  }

  @Mutation(() => Boolean)
  async starNews(
    @Args('newsId') newsId: string,
    @Args('title') title: string,
    @Args('autoUpdate', { nullable: true }) autoUpdate: boolean,
    @Args('updateFreqAmount', { nullable: true }) freqAmount: number,
    @Args('updateFreqUnit', { nullable: true }) freqUnit: string,
  ) {
    return this.newsService.starNews({ newsId, title, autoUpdate, freqAmount, freqUnit });
  }

  @Mutation(() => Boolean)
  async unstarNews(@Args('newsId') newsId: string) {
    return this.newsService.unstarNews(newsId);
  }

  @Subscription(() => NewsType, {
    filter: (payload, variables) => payload.userId === variables.userId,
  })
  onNewsUpdated(@Args('userId') userId: string) {
    return this.pubSub.asyncIterator('newsUpdated');
  }

  // 后端推送
  notifyUpdate(news: NewsType) {
    this.pubSub.publish('newsUpdated', { userId: news.userId, news });
  }
}
