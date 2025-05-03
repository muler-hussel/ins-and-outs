import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//单条新闻
export type NewsEntryDocument = NewsEntry & Document;
@Schema()
export class NewsEntry extends Document {
  @Prop({ required: true }) keyword: string;
  @Prop() timeMode: 'relative' | 'absolute';
  // 相对时间（例如：7 天）
  @Prop() relativeAmount?: number;
  @Prop() relativeUnit?:
    | 'second'
    | 'minute'
    | 'hour'
    | 'date'
    | 'month'
    | 'year';

  //绝对时间
  @Prop({ required: true, default: 'date' }) startPicker:
    | 'date'
    | 'month'
    | 'year';
  @Prop({ required: true, default: 'date' }) endPicker:
    | 'date'
    | 'month'
    | 'year';
  @Prop() absoluteStart?: Date;
  @Prop() absoluteEnd?: Date;

  @Prop({ required: true }) detailLevel: number; // e.g. 1–10
  @Prop() focus?: string;
  @Prop({ required: true }) style: string;

  @Prop({ required: true }) content: string;
  @Prop({ required: true }) generateAt: Date;

  // 用户信息，只有登录了才能收藏
  @Prop() userId: string;

  // 标题（用于展示和侧边栏），显式声明 this 的类型
  @Prop({
    type: String,
    ref: 'NewsGroup',
    field: 'title',
  })
  groupTitle?: string;
  @Prop({ required: true, default: false }) starred: boolean;
}

export const NewsEntrySchema = SchemaFactory.createForClass(NewsEntry);
