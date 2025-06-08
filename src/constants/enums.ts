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
  Tweet, // Tweet gốc
  Retweet, // chia sẻ lại 1 tweet mà không comment gì cả 
  Comment, // Comment dưới 1 tweet gốc
  QuoteTweet // chia sẻ lại 1 tweet và comment
}

export enum TweetAudience {
  Everyone, // Cho mọi người cùng xem
  TwiiterCircle // Chỉ định, có giới hạn
}