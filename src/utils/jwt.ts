import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'


export const signToken = ({payload, privateKey, options= {algorithm: 'HS256'}}:
  {
    payload: string | Buffer | Object,
    privateKey: string,
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


export const verifyToken = ({ token, secretOrPublicKey}: {token: string, secretOrPublicKey: string}) =>{
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decode) => {
      if(error){
        throw reject(error)
      }
      resolve(decode as TokenPayload)
    })
  })
}