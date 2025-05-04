import { gql } from "@apollo/client"
export const CHANGE_TITLE = gql`
  mutation ChangeTitle($titleMetaData: TitleMetaData!) {
    changeTitle(titleMetaData: $titleMetaData) {
      titleId
      title
      autoUpdate
      updateFreqAmount
      updateFreqType
      lastUpdatedAt
    }
  }
`;