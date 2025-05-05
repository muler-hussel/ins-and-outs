import { gql } from "@apollo/client";

export const ON_NEWS_UPDATED = gql`
  subscription OnNewsUpdated($userId: String!) {
    onNewsUpdated(userId: $userId) {
      news {
        _id
        content
        generateAt
        starred
      }
      titleId
    }
  }
`