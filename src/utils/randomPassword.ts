function randomPassword(length = 12) {
  if (length < 8 || length > 50) {
    throw new Error('Password length must be between 8 and 50 characters.')
  }

  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*?'

  // Đảm bảo ít nhất 1 ký tự mỗi loại
  const getRandom = (str: string) => str[Math.floor(Math.random() * str.length)]

  const mustHave = [
    getRandom(lowercase),
    getRandom(uppercase),
    getRandom(numbers),
    getRandom(symbols)
  ]

  const allChars = lowercase + uppercase + numbers + symbols

  // Tạo phần còn lại
  const remainingLength = length - mustHave.length
  const remaining = Array.from({ length: remainingLength }, () => getRandom(allChars))

  // Trộn mảng kết quả
  const passwordArray = [...mustHave, ...remaining]
    .sort(() => Math.random() - 0.5) // shuffle

  return passwordArray.join('')
}

export default randomPassword
