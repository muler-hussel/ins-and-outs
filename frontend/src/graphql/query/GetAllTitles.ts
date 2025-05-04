import { gql } from "@apollo/client"
export const GET_ALL_TITLES = gql`
  query GetAllTitles {
    getAllTitles {
      title
      lastUpdatedAt
    }
  }
`;