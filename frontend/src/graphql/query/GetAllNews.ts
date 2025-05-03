import { gql } from "@apollo/client"
export const GET_ALL_NEWS = gql`
  query GetAllNews {
    getAllNews {
      _id
      content
      generateAt
      starred
    }
  }
`;