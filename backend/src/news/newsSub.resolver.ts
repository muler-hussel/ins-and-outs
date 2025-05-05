import { Resolver, Args, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerkAuth.guard';
import { NewsMataData } from './dto/newsMetaData.dto';
import { NewsUpdateData } from './dto/newsUpdate.dto';

interface NewsUpdatedPayload {
  userId: string;
  onNewsUpdated: {
    news: NewsMataData;
    titleId: string;
  };
}

interface NewsUpdatedVariables {
  userId: string;
}

@UseGuards(ClerkAuthGuard)
@Injectable()
@Resolver(() => NewsMataData)
export class SubResolver {
  constructor(@Inject('PUB_SUB') private pubSub: PubSub) {}

  @Subscription(() => NewsUpdateData, {
    filter: (payload: NewsUpdatedPayload, variables: NewsUpdatedVariables) =>
      payload.userId === variables.userId,
  })
  //@Subscription中不能直接用@CurrentUserId()，要设置WebSocket server
  onNewsUpdated(@Args('userId') userId: string) {
    return this.pubSub.asyncIterableIterator(`newsUpdated_${userId}`);
  }

  // 后端推送
  async notifyUpdate(news: NewsMataData, userId: string, titleId: string) {
    await this.pubSub.publish(`newsUpdated_${userId}`, {
      userId,
      onNewsUpdated: {
        news,
        titleId,
      },
    });
  }
}
