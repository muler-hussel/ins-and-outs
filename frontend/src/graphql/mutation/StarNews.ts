import { gql } from "@apollo/client"
export const STAR_NEWS = gql`
  mutation StarNews($starNewsDto: StarNewsDto!) {
    starNews(starNewsDto: $starNewsDto)
  }
`;