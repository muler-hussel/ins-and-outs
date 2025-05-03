// news.resolver.ts
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { NewsType } from './types';
import { PubSub } from 'graphql-subscriptions';
import { StarNewsDto } from './dto/starNews.dto';
import { Inject, Injectable } from '@nestjs/common';

interface NewsUpdatedPayload {
  userId: string;
  news: NewsType;
}

interface NewsUpdatedVariables {
  userId: string;
}

@Injectable()
@Resolver(() => NewsType)
export class NewsResolver {
  constructor(
    private readonly newsService: NewsService,
    @Inject('PUB_SUB') private pubSub: PubSub,
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
    @Args('starNewsDto') starNewsDto: StarNewsDto,
    @Args('userId') userId: string,
  ) {
    return this.newsService.starNews(starNewsDto, userId);
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
    return this.pubSub.asyncIterableIterator(`newsUpdated_${userId}`);
  }

  // 后端推送
  async notifyUpdate(news: NewsType) {
    await this.pubSub.publish(`newsUpdated_${news.userId}`, {
      userId: news.userId,
      news,
    });
  }
}
