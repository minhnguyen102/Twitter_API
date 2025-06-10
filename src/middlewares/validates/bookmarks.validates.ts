import { config } from "dotenv";
import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import httpStatus from "~/constants/httpStatus";
import { BOOKMARK_MESSAGE } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import { validate } from "~/utils/validation";

export const validateBookmarkTweet = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async(value) => {
          if(!ObjectId.isValid(value)){
            throw new ErrorWithStatus({
              status: httpStatus.BAD_REQUEST,
              message: BOOKMARK_MESSAGE.TWEET_ID_IN_VALID
            })
          }
          const tweet = await databaseService.tweets.findOne({_id : new ObjectId(value)})
          if(!tweet){
            throw new ErrorWithStatus(
              {
                status: httpStatus.NOT_FOUND,
                message: BOOKMARK_MESSAGE.NOT_FOUND
              }
            )
          }
          return true
        }
      }
    }
  },['body', 'params'])
)