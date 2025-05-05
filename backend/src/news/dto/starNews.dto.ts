import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';

@InputType()
export class StarNewsDto {
  @Field()
  @IsString()
  newsId: string;

  @Field()
  @IsString()
  title: string;

  @Field()
  @IsBoolean()
  autoUpdate: boolean;

  @Field()
  @IsOptional()
  @IsNumber()
  updateFreqAmount?: number;

  @Field()
  @IsOptional()
  @IsIn(['second', 'minute', 'hour', 'day', 'month'])
  updateFreqType?: string;

  @Field()
  @IsString()
  content: string;

  @Field()
  @IsNumber()
  relativeAmount: number;

  @Field()
  @IsOptional()
  @IsString()
  relativeUnit?: 'second' | 'minute' | 'hour' | 'date' | 'month' | 'year';
}
