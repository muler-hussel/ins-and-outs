import { gql } from "@apollo/client"
export const GET_ALL_TITLES = gql`
  query GetAllTitles {
    getAllTitles {
      titleId
      title
      relativeAmount
      relativeUnit
      autoUpdate
      updateFreqAmount
      updateFreqType
      lastUpdatedAt
    }
  }
`;