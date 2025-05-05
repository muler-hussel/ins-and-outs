import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class StarNewsMetaData {
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
  @IsOptional()
  updateFreqAmount?: number;

  @Field()
  @IsString()
  @IsOptional()
  updateFreqType?: 'second' | 'minute' | 'hour' | 'date' | 'month';

  @Field()
  @IsNumber()
  relativeAmount: number;

  @Field()
  @IsString()
  @IsOptional()
  relativeUnit?: 'second' | 'minute' | 'hour' | 'date' | 'month' | 'year';

  @Field()
  @IsString()
  lastUpdatedAt: string;
}
