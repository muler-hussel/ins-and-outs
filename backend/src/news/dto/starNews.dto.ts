import { GenerateNewsDto } from './generateNews.dto';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';

export class StarNewsDto extends GenerateNewsDto {
  @IsString()
  newsId: string;

  @IsString()
  title: string;

  @IsBoolean()
  autoUpdate: boolean;

  @IsOptional()
  @IsNumber()
  updateFreqAmount?: number;

  @IsOptional()
  @IsIn(['second', 'minute', 'hour', 'day', 'month'])
  updateFreqType?: string;

  @IsString()
  content: string;
}
