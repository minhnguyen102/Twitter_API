import { createHash } from "crypto";
import dotevn from 'dotenv';
dotevn.config();

function sha256(content: string) {  
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string): string {
  const hash_secret = process.env.HASH_SECRET as string
  return sha256(password + hash_secret)
}

