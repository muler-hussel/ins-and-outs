import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { NewsType } from './dto/types';
import { PubSub } from 'graphql-subscriptions';
import { StarNewsDto } from './dto/starNews.dto';
import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerkAuth.guard';
import { CurrentUserId } from 'src/auth/currentUser.decorator';
import { NewsMataData } from './dto/newsMetaData.dto';
import { StarNewsMetaData } from './dto/starNewsMetaData.dto';
import { TitleMetaData } from './dto/titleMetaData.dto';

interface NewsUpdatedPayload {
  userId: string;
  news: NewsType;
}

interface NewsUpdatedVariables {
  userId: string;
}

@UseGuards(ClerkAuthGuard)
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
    return entries.map(({ generateAt, ...rest }) => ({
      generateAt: generateAt.toISOString(),
      ...rest,
    }));
  }

  @Query(() => [StarNewsMetaData])
  async getAllTitles(@CurrentUserId() userId: string) {
    return this.newsService.findTitlesByUser(userId);
  }

  @Mutation(() => Boolean)
  async starNews(
    @Args('starNewsDto') starNewsDto: StarNewsDto,
    @CurrentUserId() userId: string,
  ) {
    return this.newsService.starNews(starNewsDto, userId);
  }

  @Mutation(() => Boolean)
  async unstarNews(
    @Args('newsId') newsId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.newsService.unstarNews(newsId, userId);
  }

  @Query(() => [NewsMataData])
  async getNewsByTitleId(
    @Args('titleId') titleId: string,
    @CurrentUserId() userId: string,
  ) {
    const entries = await this.newsService.getNewsByTitleId(titleId, userId);
    return entries.map(({ generateAt, ...rest }) => ({
      generateAt: generateAt.toISOString(),
      ...rest,
    }));
  }

  @Mutation(() => StarNewsMetaData)
  async changeTitle(
    @Args('titleMetaData') titleMetaData: TitleMetaData,
    @CurrentUserId() userId: string,
  ) {
    return this.newsService.changeTitle(titleMetaData, userId);
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
