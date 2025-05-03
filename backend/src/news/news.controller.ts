import { Controller, Post, Body } from '@nestjs/common';
import { NewsService } from './news.service';
import { GenerateNewsDto } from './dto/generateNews.dto';
import { CurrentUserId } from 'src/auth/currentUser.decorator';

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post('/')
  async generate(
    @Body() dto: GenerateNewsDto,
    @CurrentUserId() userId: string | null,
  ) {
    const content = await this.newsService.generateNews(dto);
    console.log(1);
    if (userId) {
      await this.newsService.saveNews(dto, content, userId);
    }
    console.log(userId);
    return {
      _id: userId,
      content: content,
      generateAt: new Date().toISOString(),
    };
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
