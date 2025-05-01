// news.resolver.ts
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { NewsType } from './types';
import { PubSub } from 'graphql-subscriptions';
import { StarNewsDto } from './dto/starNews.dto';

interface NewsUpdatedPayload {
  userId: string;
  news: NewsType;
}

interface NewsUpdatedVariables {
  userId: string;
}

interface MyPubSub extends PubSub {
  asyncIterator<T>(triggerName: string): AsyncIterator<T>;
}

@Resolver(() => NewsType)
export class NewsResolver {
  constructor(
    private readonly newsService: NewsService,
    private pubSub: MyPubSub,
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
    @Args('starDto') starDto: StarNewsDto,
    @Args('userId') userId: string,
  ) {
    return this.newsService.starNews(starDto, userId);
  }

  @Mutation(() => Boolean)
  async unstarNews(
    @Args('newsId') newsId: string,
    @Args('userId') userId: string,
  ) {
    return this.newsService.unstarNews(newsId, userId);
  }

  @Subscription(() => NewsType, {
    filter: (payload: NewsUpdatedPayload, variables: NewsUpdatedVariables) =>
      payload.userId === variables.userId,
  })
  onNewsUpdated(@Args('userId') userId: string) {
    return this.pubSub.asyncIterator(`newsUpdated_${userId}`);
  }

  // 后端推送
  async notifyUpdate(news: NewsType) {
    await this.pubSub.publish(`newsUpdated_${news.userId}`, {
      userId: news.userId,
      news,
    });
  }
}
