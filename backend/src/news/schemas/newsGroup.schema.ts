import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

//收藏的，有同一title的新闻数组
export type NewsGroupDocument = NewsGroup & Document;
@Schema({ timestamps: true })
export class NewsGroup extends Document {
  @Prop({ required: true }) keyword: string;
  @Prop() timeMode: 'relative';
  // 相对时间（例如：7 天）
  @Prop() relativeAmount?: number;
  @Prop() relativeUnit?:
    | 'second'
    | 'minute'
    | 'hour'
    | 'date'
    | 'month'
    | 'year';

  @Prop({ required: true }) detailLevel: number; // e.g. 1–10
  @Prop() focus?: string;
  @Prop({ required: true }) style: string;

  // 用户信息，只有登录了才能收藏
  @Prop() userId: string;

  // 标题（用于展示和侧边栏），显式声明 this 的类型
  @Prop({
    type: String,
    ref: 'NewsEntry',
    required: true,
  })
  title: string;

  // 自动更新设定
  @Prop({ default: false }) autoUpdate: boolean;
  @Prop() updateFreqAmount?: number; // 默认为0，只要有新闻就更新
  @Prop() updateFreqType?: 'second' | 'minute' | 'hour' | 'date' | 'month';

  //按照频率检查后，如果有新闻就更新，没有则等到有新闻再更新
  @Prop() lastCheckedAt: Date;
  @Prop() lastUpdatedAt: Date;
  @Prop() contents: [ObjectId];
}

export const NewsGroupSchema = SchemaFactory.createForClass(NewsGroup);
