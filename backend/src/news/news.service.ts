import { Injectable, NotFoundException } from '@nestjs/common';
import { GenerateNewsDto } from './dto/generateNews.dto';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsEntry, NewsEntryDocument } from './schemas/newEntry.schema';

@Injectable()
export class NewsService {
  client = new OpenAI({
    baseURL: process.env.API_URL,
    apiKey: process.env.API_KEY,
    timeout: 30000,
  });
  constructor(
    @InjectModel(NewsEntry.name)
    private newsEntryModel: Model<NewsEntryDocument>,
  ) {}

  async generateNews(dto: GenerateNewsDto): Promise<string> {
    const prompt = this.buildPrompt(dto);
    return await this.generate(prompt);
  }

  async saveNews(
    dto: GenerateNewsDto,
    content: string,
    userId: string,
    generateAt: Date,
  ) {
    return this.newsEntryModel.create({
      ...dto,
      content: content,
      generateAt: generateAt,
      userId: userId,
      absoluteStart: dto.absoluteStart ? new Date(dto.absoluteStart) : null,
      absoluteEnd: dto.absoluteEnd ? new Date(dto.absoluteEnd) : null,
    });
  }

  async getParamsById(
    newsId: string,
    userId: string,
  ): Promise<GenerateNewsDto> {
    const news = await this.newsEntryModel.findById(newsId).lean();

    if (!news || (news.userId && news.userId !== userId)) {
      throw new NotFoundException('News not found or access denied');
    }

    return {
      ...news,
      absoluteStart: news.absoluteStart?.toISOString(),
      absoluteEnd: news.absoluteEnd?.toISOString(),
    };
  }

  async findAllByUser(userId: string) {
    return this.newsEntryModel
      .find({ userId }, { _id: 1, content: 1, generateAt: 1, starred: 1 })
      .lean();
  }

  private buildPrompt(dto: GenerateNewsDto): string {
    const {
      keyword,
      timeMode,
      relativeAmount,
      relativeUnit,
      absoluteStart,
      absoluteEnd,
      detailLevel,
      focus,
      style,
    } = dto;

    const curDate = new Date().toDateString();

    return (
      `请根据以下条件生成一篇新闻来龙去脉概述：

      关键词：${keyword}
      时间范围：` +
      (timeMode === 'relative'
        ? `${curDate}的${relativeAmount} ${relativeUnit} 前`
        : `从${absoluteStart}到${absoluteEnd}`) +
      `详细程度：${detailLevel}字
      风格：${style}
      ${focus ? `重点关注：${focus}` : ''}

      请以连贯自然的语言描述该事件的起因、发展和结果，长度大约控制在 ${detailLevel} 字左右。`
    );
  }

  private async generate(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 返回了空内容');
    }

    return content;
  }
}
