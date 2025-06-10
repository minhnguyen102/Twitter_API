import { ObjectId, WithId } from "mongodb"
import databaseService from "./database.services"
import Bookmark from "~/models/schemas/Bookmark.schema"
import { BOOKMARK_MESSAGE } from "~/constants/messages"

class BookmarkService{
  async bookmarkTweet(user_id: string, tweet_id: string){
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    )
    return result as WithId<Bookmark>
  }

  async unBookmarkTweet(user_id: string, tweet_id: string){
    await databaseService.bookmarks.findOneAndDelete(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      }
    )
    return {
      message : BOOKMARK_MESSAGE.UN_BOOKMARK_SUCCESSFULLY,
    }
  }
}

const bookmarkService = new BookmarkService()

export default bookmarkService