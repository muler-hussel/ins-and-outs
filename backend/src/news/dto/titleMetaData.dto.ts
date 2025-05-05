import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

@InputType()
export class TitleMetaData {
  @Field()
  @IsString()
  titleId: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsBoolean()
  autoUpdate: boolean;

  @Field()
  @IsNumber()
  updateFreqAmount?: number;

  @Field()
  @IsString()
  updateFreqType?: 'second' | 'minute' | 'hour' | 'date' | 'month';

  @Field()
  @IsNumber()
  relativeAmount: number;

  @Field()
  @IsString()
  relativeUnit?: 'second' | 'minute' | 'hour' | 'date' | 'month' | 'year';

  @Field()
  @IsString()
  lastUpdatedAt: string;
}
