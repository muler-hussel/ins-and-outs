import { gql } from "@apollo/client"
export const UN_STAR_NEWS = gql`
  mutation UnStarNews($newsId: String!) {
    unstarNews(newsId: $newsId)
  }
`;