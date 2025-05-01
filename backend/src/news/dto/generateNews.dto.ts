import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class GenerateNewsDto {
  @IsString()
  keyword: string;

  @IsIn(['relative', 'absolute']) timeRangeType: 'relative' | 'absolute';
  // 相对
  @IsOptional() @IsNumber() relativeAmount?: number;
  @IsOptional()
  @IsIn(['second', 'minute', 'hour', 'day', 'month', 'year'])
  relativeUnit?: string;

  // 绝对，前端dayjs转isostring后传入
  @IsOptional() @IsString() absoluteStart?: string;
  @IsOptional() @IsString() absoluteEnd?: string;

  @IsNumber()
  detailLevel: number;

  @IsOptional()
  @IsString()
  focus?: string;

  @IsString()
  style: string;
}
