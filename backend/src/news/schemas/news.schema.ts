import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NewsGeneration extends Document {
  @Prop({ required: true }) keyword: string;
  @Prop({ required: true }) timeRange: string; // e.g. '7d'
  @Prop({ required: true }) detailLevel: number; // e.g. 1–10
  @Prop() focus?: string;
  @Prop({ required: true }) style: string;

  @Prop({ required: true }) content: string;

  // 用户信息（可空）
  @Prop() userId?: string;

  // 标题（用于展示和侧边栏），显式声明 this 的类型
  @Prop({
    default: function (this: { keyword: string }) {
      return this.keyword;
    },
  })
  title: string;

  // 自动更新设定
  @Prop({ default: false }) autoUpdate: boolean;
  @Prop() updateFreqAmount?: number; // 默认为0，只要有新闻就更新
  @Prop() updateFreqType?: string; //默认为天，可设置分秒

  @Prop() lastCheckedAt?: Date;
  @Prop() lastUpdatedAt?: Date;
}

export const NewsSchema = SchemaFactory.createForClass(NewsGeneration);
