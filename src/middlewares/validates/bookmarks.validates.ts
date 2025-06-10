import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import { BOOKMARK_MESSAGE } from "~/constants/messages";
import { validate } from "~/utils/validation";

export const validateBookmarkTweet = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: (value) => {
          if(!value){
            throw new Error(BOOKMARK_MESSAGE.TWEET_ID_NOT_NULL)
          }
          if(!ObjectId.isValid(value)){
            throw new Error(BOOKMARK_MESSAGE.TWEET_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          return true
        }
      }
    }
  },['body'])
)