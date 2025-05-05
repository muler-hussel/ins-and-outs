import { Field, ObjectType } from '@nestjs/graphql';
import { NewsMataData } from './newsMetaData.dto';

@ObjectType()
export class NewsUpdateData {
  @Field(() => NewsMataData)
  news: NewsMataData;

  @Field()
  titleId: string;
}
