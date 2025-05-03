import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class NewsType {
  @Field(() => ID)
  newsId: string;

  @Field({ nullable: true })
  groupTitle?: string;

  @Field()
  keyword: string;

  @Field()
  content: string;

  @Field()
  generateAt: Date;

  @Field({ nullable: true })
  focus?: string;

  @Field()
  detailLevel: number;

  @Field()
  timeMode: string;
  @Field({ nullable: true })
  relativeAmount?: number;
  @Field({ nullable: true })
  relativeUnit?: string;
  @Field({ nullable: true })
  absoluteStart?: string;
  @Field({ nullable: true })
  absoluteEnd?: string;

  @Field()
  style: string;

  @Field({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  isStarred?: boolean;

  @Field({ nullable: true })
  autoUpdate?: boolean;

  @Field({ nullable: true })
  updateFreqAmount?: number;

  @Field({ nullable: true })
  updateFreqType?: string;

  @Field({ nullable: true })
  lastUpdatedAt?: Date;

  @Field({ nullable: true })
  lastCheckedAt?: Date;

  @Field()
  generatedAt: Date;
}
