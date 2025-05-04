import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { NewsType } from './types';
import { PubSub } from 'graphql-subscriptions';
import { StarNewsDto } from './dto/starNews.dto';
import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerkAuth.guard';
import { CurrentUserId } from 'src/auth/currentUser.decorator';
import { NewsMataData } from './dto/newsMetaData.dto';
import { Types } from 'mongoose';
import { StarNewsMataData } from './dto/starNewsMetaData.dto';

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

  @Query(() => [NewsMataData])
  async getAllNews(@CurrentUserId() userId: string) {
    const entries = await this.newsService.findAllByUser(userId);
    return entries.map((e) => ({
      _id: (e._id as Types.ObjectId).toString(),
      content: e.content,
      generateAt: e.generateAt.toISOString(),
      starred: e.starred,
    }));
  }

  @UseGuards(ClerkAuthGuard)
  @Query(() => [StarNewsMataData])
  async getAllTitles(@CurrentUserId() userId: string) {
    const entries = await this.newsService.findTitlesByUser(userId);
    return entries.map((e) => ({
      title: e.title,
      lastUpdatedAt: e.lastUpdatedAt.toISOString(),
    }));
  }

  @UseGuards(ClerkAuthGuard)
  @Mutation(() => Boolean)
  async starNews(
    @Args('starNewsDto') starNewsDto: StarNewsDto,
    @CurrentUserId() userId: string,
  ) {
    return this.newsService.starNews(starNewsDto, userId);
  }

  @UseGuards(ClerkAuthGuard)
  @Mutation(() => Boolean)
  async unstarNews(
    @Args('newsId') newsId: string,
    @CurrentUserId() userId: string,
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
