import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

@InputType()
export class GenerateNewsDto {
  @Field()
  @IsString()
  keyword: string;

  @Field()
  @IsIn(['relative', 'absolute'])
  timeMode: 'relative' | 'absolute';

  // 相对
  @Field()
  @IsOptional()
  @IsNumber()
  relativeAmount?: number;

  @Field()
  @IsOptional()
  @IsIn(['second', 'minute', 'hour', 'day', 'month', 'year'])
  relativeUnit?: string;

  // 绝对，前端dayjs转isostring后传入
  @Field() @IsOptional() @IsString() absoluteStart?: string;
  @Field() @IsOptional() @IsString() absoluteEnd?: string;

  @Field()
  @IsNumber()
  detailLevel: number;

  @Field()
  @IsOptional()
  @IsString()
  focus?: string;

  @Field()
  @IsString()
  style: string;
}
