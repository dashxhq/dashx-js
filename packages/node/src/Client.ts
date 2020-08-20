import fs from 'fs'
import http from 'got'
import type { Response } from 'got'

type Attachment = {
  file: string | Buffer,
  name: string
}

type Parcel = {
  to: string,
  attachments: Attachment[],
  cc: string[],
  data: Record<string, any>
}

const readAttachment = (attachment: Attachment) => new Promise((resolve, reject) => {
  fs.readFile(attachment.file, (err, data) => {
    if (err) reject(err)
    resolve({
      content: Buffer.from(data).toString('base64'),
      name: attachment.name
    })
  })
})

const processAttachments = (parcel: Parcel) => {
  if (!parcel.attachments) {
    return Promise.resolve(parcel)
  }

  return Promise.all(
    parcel.attachments.map(readAttachment)
  ).then((processedAttachments) => ({ ...parcel, attachments: processedAttachments }),)
}

class Client {
  publicKey?: string

  privateKey?: string

  baseUri: string

  constructor({
    baseUri = process.env.DASHX_BASE_URI || 'https://api.dashx.com/v1',
    publicKey = process.env.DASHX_PUBLIC_KEY,
    privateKey = process.env.DASHX_PRIVATE_KEY
  } = {}) {
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  deliver(messageIdentifier: string, parcel: Parcel): Promise<void | Response<string>> {
    return processAttachments(parcel).then((finalParcel) => http.post('/deliveries', {
      prefixUrl: this.baseUri,
      headers: {
        'User-Agent': 'dashx-node',
        'X-Public-Key': this.publicKey,
        'X-Private-Key': this.privateKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message_identifier: messageIdentifier,
        ...finalParcel
      })
    }))
  }
}

export default Client
