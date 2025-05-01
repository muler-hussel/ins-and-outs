// news.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { NewsService } from './news.service';
import { GenerateNewsDto } from './dto/generateNews.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
  userId = '1'; //TODO

  @Post('/')
  async generate(@Body() dto: GenerateNewsDto) {
    const content = await this.newsService.generateNews(dto);
    //如果登录才保存 todo
    await this.newsService.saveNews(dto, content, this.userId);
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
