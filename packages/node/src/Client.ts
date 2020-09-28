import http from 'got'
import uuid from 'uuid-random'
import type { Response } from 'got'

import { snakeCaseKeys } from './utils'

type Parcel = {
  to: string[] | string,
  body: string,
  data: Record<string, any>
}

type IdentifyParams = {
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string
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
    return http(uri, {
      json: snakeCaseKeys(body),
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

  identify(uid: string, options?: IdentifyParams) : Promise<Response>
  identify(options?: IdentifyParams) : Promise<Response>
  identify(
    uid: string | IdentifyParams = {}, options: IdentifyParams = {} as IdentifyParams
  ): Promise<Response> {
    let params

    if (typeof uid === 'string') {
      params = { uid, ...options }
    } else {
      params = {
        anonymousUid: uuid(),
        ...options
      }
    }

    return this.makeHttpRequest('/identify', params)
  }

  track(event: string, uid: string, data: Record<string, any>): Promise<Response> {
    return this.makeHttpRequest('/track', { event, uid, data })
  }
}

export default Client
