import { error } from 'console'
import jwt, { SignOptions } from 'jsonwebtoken'
import { reject } from 'lodash'
import { resolve } from 'path'

export const signToken = ({payload, privateKey = process.env.JWT_SECRET as string, options= {algorithm: 'HS256'}}:
  {
    payload: string | Buffer | Object,
    privateKey?: string,
    options?: SignOptions
  }
) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) =>{
      if(error){
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}
export const verifyToken = ({ token, secretOrPublicKey = process.env.JWT_SECRET as string}: {token: string, secretOrPublicKey?: string}) =>{
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decode) => {
      if(error){
        throw reject(error)
      }
      resolve(decode as jwt.JwtPayload)
    })
  })
}