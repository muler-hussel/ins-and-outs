import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { StarNewsDto } from './dto/starNews.dto';
import { Injectable, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerkAuth.guard';
import { CurrentUserId } from 'src/auth/currentUser.decorator';
import { NewsMataData } from './dto/newsMetaData.dto';
import { StarNewsMetaData } from './dto/starNewsMetaData.dto';
import { TitleMetaData } from './dto/titleMetaData.dto';
import { NewsGroupService } from './newsGroup.service';

@UseGuards(ClerkAuthGuard)
@Injectable()
@Resolver(() => NewsMataData)
export class NewsResolver {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsGroupService: NewsGroupService,
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
    return this.newsGroupService.findTitlesByUser(userId);
  }

  @Mutation(() => Boolean)
  async starNews(
    @Args('starNewsDto') starNewsDto: StarNewsDto,
    @CurrentUserId() userId: string,
  ) {
    return this.newsGroupService.starNews(starNewsDto, userId);
  }

  @Mutation(() => Boolean)
  async unstarNews(
    @Args('newsId') newsId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.newsGroupService.unstarNews(newsId, userId);
  }

  @Query(() => [NewsMataData])
  async getNewsByTitleId(
    @Args('titleId') titleId: string,
    @CurrentUserId() userId: string,
  ) {
    const entries = await this.newsGroupService.getNewsByTitleId(
      titleId,
      userId,
    );
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
    return this.newsGroupService.changeTitle(titleMetaData, userId);
  }
}
