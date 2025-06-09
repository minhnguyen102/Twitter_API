import { checkSchema } from "express-validator"
import { isEmpty } from "lodash"
import { ObjectId } from "mongodb"
import { MediaType, TweetAudience, TweetType } from "~/constants/enums"
import { TWEET_MESSAGE } from "~/constants/messages"
import { numberEnumToArray } from "~/utils/others"
import { validate } from "~/utils/validation"

const tweetsType = numberEnumToArray(TweetType)
const tweetsAudience = numberEnumToArray(TweetAudience)
const medias = numberEnumToArray(MediaType)
export const validateCreateTweet = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetsType],
        errorMessage: TWEET_MESSAGE
      }
    },
    audience: {
      isIn: {
        options: [tweetsAudience],
        errorMessage: TWEET_MESSAGE
      }
    },
    parent_id: {
      custom: {
        options: (value, {req}) => {
          const type = req.body.type as TweetType
          if([TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) && !ObjectId.isValid(value)){
            throw new Error(TWEET_MESSAGE.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }

          if(TweetType.Tweet && value !== null){
            throw new Error(TWEET_MESSAGE.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, {req}) => {
          const type = req.body.type as TweetType
          const medias = req.body.medias
          const hashtags = req.body.hashtags
          const mentions = req.body.mentions
          if(type === TweetType.Retweet && value !== null){
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_NULL)
          }

          if([TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) && isEmpty(medias) && isEmpty(hashtags) && isEmpty(mentions) && value === null){
            throw new Error(TWEET_MESSAGE.CONTENT_MUST_BE_PROVIDED)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value) => {
          // nếu mảng hashtags không rỗng thì phải là mảng các chuỗi
          if(!isEmpty(value) && !value.every((item: any) => typeof item === 'string')){
            throw new Error(TWEET_MESSAGE.HASHTAGS_MUST_BE_ARRAY_OF_STRINGS)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value) => {
          // nếu mảng mentions không rỗng thì phải là mảng các user_id
          if(!isEmpty(value) && !value.every((item: any) => ObjectId.isValid(item))){
            throw new Error(TWEET_MESSAGE.MENTIONS_MUST_BE_ARRAY_OF_USER_IDS)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value) => {
          // yêu cầu mỗi phần tử trong media là Media Object
          // Media Object có dạng { url: string, type: string }
          if(value.some((item: any) => typeof item.url != 'string' || !medias.includes(item.type))){
            throw new Error(TWEET_MESSAGE.MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECTS)
          }
          return true
        }
      }
    }
  },['body'])
)