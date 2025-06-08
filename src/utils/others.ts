export const numberEnumToArray = (numberEnum: {[key: string] : string | number }) => {
  // console.log( "value: ", Object.values(numberEnum)) // trả về 1 mảng các value
  // console.log("keys: ", Object.keys(numberEnum)) // trả về 1 mảng các value
  return Object.values(numberEnum).filter(value => typeof value === 'number') as number[]
}