import { PaginationQuery } from "./Tweet.requets";

export interface searchQuery extends PaginationQuery{
  keyword: string
}