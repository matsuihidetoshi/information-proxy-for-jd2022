import * as AWS from 'aws-sdk'
import axios from 'axios'
AWS.config.update({ region: "ap-northeast-1" })
AWS.config.apiVersions = {
  s3: "2006-03-01",
}

export const handler = async () => {
  const sourceApiEndpoint: string = process.env.SOURCE_API_ENDPOINT || ''
  const s3BucketName: string = process.env.S3_BUCKET_NAME || ''

  const params: { Bucket: string, Key: string, Body: string} = {
    Bucket: s3BucketName,
    Key: 'schedule.json',
    Body: '',
  }

  const s3 = new AWS.S3()

  try {
    await axios.get(sourceApiEndpoint).then((response) => { params.Body = JSON.stringify(response.data) })
    await s3.putObject(params).promise()
  } catch(err) {
    console.log(err)
    return err
  }
}
