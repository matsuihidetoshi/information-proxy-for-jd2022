export async function handler(event:any) {
  console.log(JSON.stringify(event))
  return {
    statusCode: 200,
    body: "hello"
  }
}
