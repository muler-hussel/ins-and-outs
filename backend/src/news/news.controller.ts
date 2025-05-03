import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { NewsService } from './news.service';
import { GenerateNewsDto } from './dto/generateNews.dto';
import { CurrentUserId } from 'src/auth/currentUser.decorator';
import { ClerkAuthGuard } from 'src/auth/clerkAuth.guard';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; sessionId: string };
}

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('/')
  async generate(
    @Body() dto: GenerateNewsDto,
    @CurrentUserId() userId: string | null,
  ) {
    const content = await this.newsService.generateNews(dto);
    const generateDate = new Date();
    let _id = '';
    if (userId) {
      const save = await this.newsService.saveNews(
        dto,
        content,
        userId,
        generateDate,
      );
      _id = save._id as string;
    }

    return {
      ...dto,
      _id: _id,
      content: content,
      generateAt: generateDate.toISOString(),
    };
  }

  @UseGuards(ClerkAuthGuard)
  @Get('/:id/params')
  async getNewsParams(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.newsService.getParamsById(id, req.user?.userId as string);
  }

  //检查新内容是否可生成，用于自动更新判定
  // @Get('check')
  // async checkNews(@Query('keyword') keyword: string, @Query('start') start: string, @Query('end') end: string) {
  //   return this.newsService.checkForNewArticles(
  //     keyword,
  //     new Date(start),
  //     new Date(end),
  //   );
  // }
}
