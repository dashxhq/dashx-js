import fetch from 'unfetch'
import qs from 'qs'
import uuid from 'uuid-random'

import ContentOptionsBuilder from './ContentOptionsBuilder'
import { identifyAccountRequest, pushContentRequest, trackEventRequest } from './graphql';
import generateContext from './context'
import { getItem, setItem } from './storage'
import { snakeCaseKeys } from './utils'
import type { Context } from './context'
import type { ContentOptions } from './ContentOptionsBuilder'

type ClientParams = {
  publicKey: string,
  baseUri?: string
}

type GraphqlRequest = (variables?: object | undefined) => string

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

  constructor({ publicKey, baseUri = 'https://api.dashx.com/graphql' }: ClientParams) {
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

  private async makeHttpRequest(request: GraphqlRequest, params: any): Promise<Response> {
    const requestParams = snakeCaseKeys(params)

    const response = await fetch(this.baseUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify(requestParams)
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

    return this.makeHttpRequest(identifyAccountRequest, params)
  }

  reset(): void {
    this.uid = null
    this.generateAnonymousUid(true)
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const params = { event, data, uid: this.uid, anonymous_uid: this.anonymousUid }

    return this.makeHttpRequest(trackEventRequest, params)
  }

  content(
    contentType: string, options?: ContentOptions
  ): ContentOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeHttpRequest(
        pushContentRequest,
        { ...options, contentType }
      )
    }

    return new ContentOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest(
        pushContentRequest,
        { ...wrappedOptions, contentType }
      )
    )
  }
}

export default Client
export type { ClientParams }
