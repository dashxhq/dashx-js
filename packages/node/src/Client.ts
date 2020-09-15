import http from 'got'
import type { Response } from 'got'

type Parcel = {
  to: string[],
  body: string,
  data: Record<string, any>
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

  private makeHttpRequest<T>(uri: string, body: T): Promise<Response> {
    return http(`/${uri}`, {
      json: body,
      method: 'POST',
      prefixUrl: this.baseUri,
      headers: {
        'User-Agent': 'dashx-node',
        'X-Public-Key': this.publicKey,
        'X-Private-Key': this.privateKey,
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
  }

  deliver(parcel: Parcel): Promise<Response> {
    return this.makeHttpRequest('/deliver', parcel)
  }
}

export default Client
