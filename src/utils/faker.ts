import { faker } from "@faker-js/faker"
import { ObjectId } from "mongodb"
import { TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums"
import { TweetReqBody } from "~/models/requests/Tweet.requets"
import { RegisterReqBody } from "~/models/requests/User.requests"
import User from "~/models/schemas/User.schema"
import databaseService from "~/services/database.services"
import { hashPassword } from "./crypto"
import Follower from "~/models/schemas/Follower.schema"
import Tweet from "~/models/schemas/Tweet.schema"
import tweetService from "~/services/tweet.services"


// Password for fake user
const PASSWORD = "MinhNguyen102@twetter"
// My ID, use for follow other user
const MYID = new ObjectId("6847adee43d1cdc12e440f9d")
// Number of user created, each user created 2 tweet
const NUMBER_USER = 100
 
const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.username(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.birthdate().toISOString()
  }
  return user
}

const createRandomTweet = () => {
  const tweet: TweetReqBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 100
    }),
    parent_id: null, // need checked
    hashtags: [],
    mentions: [],
    medias: []
  }
  return tweet 
}

const users: RegisterReqBody[] = faker.helpers.multiple(
  createRandomUser,
  { count: NUMBER_USER }
)

const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log("Creating users...")
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseService.users.insertOne(
        new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_od_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

const followMultipleUser = async (user_id: ObjectId, followed_user_id: ObjectId[] ) => {
  console.log("Start following...")
  const result = await Promise.all(
    followed_user_id.map(async (followed_user_id) => {
      databaseService.followers.insertOne(new Follower({
        user_id,
        followed_user_id
      }))
    })
  )
  console.log(`Followed ${result.length} users`)
}

const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log('Creating tweet...')
  console.log('Counting...')
  let count = 0
  const result = await Promise.all(
    ids.map(async(id) => {
      await Promise.all([
        tweetService.createTweet(id.toString(), createRandomTweet()),
        tweetService.createTweet(id.toString(), createRandomTweet())
      ])
      count+=2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

insertMultipleUsers(users).then((ids) => {
  console.log(ids)
  followMultipleUser(MYID, ids),
  insertMultipleTweets(ids)
})