import { gql } from "@apollo/client"
export const CHANGE_TITLE = gql`
  mutation ChangeTitle($titleMetaData: TitleMetaData!) {
    changeTitle(titleMetaData: $titleMetaData) {
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