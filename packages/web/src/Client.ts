import fetch from 'unfetch'
import uuid from 'uuid-random'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import generateContext from './context'
import { getItem, setItem } from './storage'
import type { Context } from './context'
import type { ContentOptions } from './ContentOptionsBuilder'

type ClientParams = {
  publicKey: string,
  baseUri?: string
}

type Method = 'GET' | 'POST'

type IdentifyParams = Record<string, string | number> & {
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string
}

class Client {
  anonymousUid: string | null = null

  context: Context

  publicKey: string

  baseUri: string

  uid: string | null = null

  constructor({ publicKey, baseUri = 'https://api.dashx.com/v1' }: ClientParams) {
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.context = generateContext()
    this.generateAnonymousUid()
  }

  private generateAnonymousUid(regenerate = false): void {
    const anonymousUid = getItem('anonymousUid')
    if (!regenerate && anonymousUid) {
      this.anonymousUid = anonymousUid
      return
    }

    this.anonymousUid = uuid()
    setItem('anonymousUid', this.anonymousUid)
  }

  private async makeHttpRequest(uri: string, { body, method = 'POST' }: { body: any, method?: Method}): Promise<Response> {
    const requestUri = method === 'GET' ? `${this.baseUri}/${uri}?${new URLSearchParams(body).toString()}` : `${this.baseUri}/${uri}`
    const response = await fetch(requestUri, {
      method,
      headers: {
        'X-Public-Key': this.publicKey
      },
      body: method === 'GET' ? undefined : JSON.stringify(body)
    })

    return response.json()
  }

  identify(uid: string) : void
  identify(options: IdentifyParams) : Promise<Response>
  identify(options: string | IdentifyParams): Promise<Response> | void {
    if (typeof options === 'string') {
      this.uid = options
      return undefined
    }

    if (!options) {
      throw new Error('Cannot be called with undefined or null, either pass uid: string or options: object')
    }

    const { firstName, lastName, ...others } = options
    const body = {
      anonymous_uid: this.anonymousUid,
      first_name: firstName,
      last_name: lastName,
      ...others
    }

    return this.makeHttpRequest('identify', { body })
  }

  reset(): void {
    this.uid = null
    this.generateAnonymousUid(true)
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const body = { event, data, uid: this.uid, anonymous_uid: this.anonymousUid }

    return this.makeHttpRequest('track', { body })
  }

  content(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeHttpRequest(
        'content',
        { body: { ...options, contentType }, method: 'GET' }
      )
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest(
        'content',
        { body: { ...wrappedOptions, contentType }, method: 'GET' }
      )
    )
  }
}

export default Client
export type { ClientParams }
