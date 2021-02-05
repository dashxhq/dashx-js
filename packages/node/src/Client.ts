import crypto from 'crypto'
import http from 'got'
import qs from 'qs'
import uuid from 'uuid-random'
import type { Response } from 'got'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import { deliverRequest, identifyAccountRequest, pushContentRequest, trackEventRequest } from './graphql'
import type { ContentOptions } from './ContentOptionsBuilder'

type GraphqlRequest = (variables?: object | undefined) => string

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
    baseUri = process.env.DASHX_BASE_URI || 'https://api.dashx.com/graphql',
    publicKey = process.env.DASHX_PUBLIC_KEY,
    privateKey = process.env.DASHX_PRIVATE_KEY
  } = {}) {
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  private makeHttpRequest(request: GraphqlRequest, params: any): Promise<Response> {
    return http(this.baseUri, {
      body: request(params),
      method: 'POST',
      headers: {
        'User-Agent': 'dashx-node',
        'X-Public-Key': this.publicKey,
        'X-Private-Key': this.privateKey,
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
      .json()
  }

  deliver(parcel: Parcel): Promise<Response> {
    return this.makeHttpRequest(deliverRequest, parcel)
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

    return this.makeHttpRequest(identifyAccountRequest, params)
  }

  generateIdentityToken(uid: string): string {
    if (!this.privateKey) {
      throw new Error('Private key not set')
    }

    const nonce = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.privateKey), nonce, {
      authTagLength: 16
    })
    const encrypted = Buffer.concat([ cipher.update(uid), cipher.final() ])
    const encryptedToken = Buffer.concat([ nonce, encrypted, cipher.getAuthTag() ])

    // Base64.urlsafe_encode64
    return encryptedToken.toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
  }

  track(event: string, uid: string, data: Record<string, any>): Promise<Response> {
    return this.makeHttpRequest(trackEventRequest, { event, uid, data })
  }

  content(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeHttpRequest(pushContentRequest, { ...options, contentType })
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest(pushContentRequest, { ...wrappedOptions, contentType })
    )
  }
}

export default Client
