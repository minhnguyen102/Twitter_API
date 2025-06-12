import { da } from "@faker-js/faker"
import databaseService from "./database.services"

class SearchService{
  async search({content, limit, page} : {content: string, limit: number, page: number}){
    const result = await databaseService.tweets.find({
      $text: {
        $search: content
      }
    })
    .limit(limit)
    .skip(limit * (page - 1))
    .toArray()
    return result
  }
}

const searchService = new SearchService()
export default searchService