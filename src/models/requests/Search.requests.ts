import { MediaTypeQuery } from "~/constants/enums";
import { PaginationQuery } from "./Tweet.requets";

export interface searchQuery extends PaginationQuery{
  content: string
  mediaType: MediaTypeQuery
  peopleFollow: string
}