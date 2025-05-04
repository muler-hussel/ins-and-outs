import { gql } from "@apollo/client"
export const GET_NEWS_BY_TITLE_ID = gql`
  query GetNewsByTitleId($titleId: String!) {
    getNewsByTitleId(titleId: $titleId) {
      _id
      content
      generateAt
      starred
    }
  }
`;