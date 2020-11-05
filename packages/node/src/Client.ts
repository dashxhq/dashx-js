import crypto from 'crypto'
import http from 'got'
import qs from 'qs'
import uuid from 'uuid-random'
import type { Response } from 'got'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import { snakeCaseKeys } from './utils'
import type { ContentOptions } from './ContentOptionsBuilder'

type Method = 'GET' | 'POST'

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

  private makeHttpRequest(uri: string, { method = 'POST', params }: { method?: Method, params: any }): Promise<Response> {
    const requestParams = snakeCaseKeys(params)
    const requestUri = method === 'GET' ? `${this.baseUri + uri}?${qs.stringify(requestParams)}` : this.baseUri + uri

    return http(requestUri, {
      json: method === 'POST' ? requestParams : undefined,
      method,
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
    return this.makeHttpRequest('/deliver', { params: parcel })
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

    return this.makeHttpRequest('/identify', { params })
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
    return this.makeHttpRequest('/track', { params: { event, uid, data } })
  }

  content(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeHttpRequest('/content', { params: { ...options, contentType }, method: 'GET' })
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest('/content', { params: { ...wrappedOptions, contentType }, method: 'GET' })
    )
  }
}

export default Client
