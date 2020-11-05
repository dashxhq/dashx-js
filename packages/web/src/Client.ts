import fetch from 'unfetch'
import uuid from 'uuid-random'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import generateContext from './context'
import { getItem, setItem } from './storage'
import { snakeCaseKeys } from './utils'
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

  private async makeHttpRequest(uri: string, { params, method = 'POST' }: { params: any, method?: Method}): Promise<Response> {
    const requestParams = snakeCaseKeys(params)

    const requestUri = method === 'GET' ? `${this.baseUri}/${uri}?${new URLSearchParams(requestParams).toString()}` : `${this.baseUri}/${uri}`

    const response = await fetch(requestUri, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey
      },
      body: method === 'GET' ? undefined : JSON.stringify(requestParams)
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

    const { firstName, lastName, ...others } = options
    const params = {
      anonymous_uid: this.anonymousUid,
      first_name: firstName,
      last_name: lastName,
      ...others
    }

    return this.makeHttpRequest('identify', { params })
  }

  reset(): void {
    this.uid = null
    this.generateAnonymousUid(true)
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const params = { event, data, uid: this.uid, anonymous_uid: this.anonymousUid }

    return this.makeHttpRequest('track', { params })
  }

  content(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeHttpRequest(
        'content',
        { params: { ...options, contentType }, method: 'GET' }
      )
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest(
        'content',
        { params: { ...wrappedOptions, contentType }, method: 'GET' }
      )
    )
  }
}

export default Client
export type { ClientParams }
