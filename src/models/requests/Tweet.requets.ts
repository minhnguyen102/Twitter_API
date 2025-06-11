import { TweetAudience, TweetType } from "~/constants/enums"
import { Media } from "../Others"
import {ParamsDictionary, Query} from "express-serve-static-core"

export interface TweetReqBody{
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[] // ['java', 'nodejs']
  mentions: string[] // ['minhnguyen', 'elonmusk']
  medias: Media[]
}

export interface TweetParam extends ParamsDictionary{
  tweet_id: string
}

export interface TweetQuery extends Query{
  type: string
  limit: string
  page: string
}