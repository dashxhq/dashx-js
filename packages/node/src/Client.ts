import http from 'got'
import uuid from 'uuid-random'
import type { Response } from 'got'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import type { ContentOptions } from 'ContentOptionsBuilder'

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

  identify(uid: string, options?: IdentifyParams) : Promise<Response>
  identify(options?: IdentifyParams) : Promise<Response>
  identify(
    uid: string | IdentifyParams = {}, options: IdentifyParams = {} as IdentifyParams
  ): Promise<Response> {
    let params

    if (typeof uid === 'string') {
      const { firstName, lastName, ...others } = options
      params = { uid, first_name: firstName, last_name: lastName, ...others }
    } else {
      const { firstName, lastName, ...others } = uid
      params = {
        anonymous_uid: uuid(),
        first_name: firstName,
        last_name: lastName,
        ...others
      }
    }

    return this.makeHttpRequest('identify', params)
  }

  track(event: string, uid: string, data: Record<string, any>): Promise<Response> {
    return this.makeHttpRequest('track', { event, uid, data })
  }

  content(page: string, options?: ContentOptions) {
    const defaultOptions: Partial<ContentOptions> = { returnType: 'all' }

    if(options) {
      return this.makeHttpRequest('content', options)
    }

    return new ContentOptionsBuilder(
      defaultOptions,
      (wrappedOptions) => this.makeHttpRequest('content', wrappedOptions)
    )
  }
}

export default Client
