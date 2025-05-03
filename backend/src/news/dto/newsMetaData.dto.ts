import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsBoolean } from 'class-validator';

@ObjectType()
export class NewsMataData {
  @Field()
  @IsString()
  _id: string;

  @Field()
  @IsString()
  content: string;

  @Field()
  @IsString()
  generateAt: string;

  @Field()
  @IsBoolean()
  starred: boolean;
}
