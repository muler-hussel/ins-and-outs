import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class StarNewsMataData {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  lastUpdatedAt: string;
}
