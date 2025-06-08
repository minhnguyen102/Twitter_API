export enum TokenType{
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banner
}
export enum MediaType {
  Image,
  Video
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwiiterCircle
}