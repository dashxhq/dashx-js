import fetch from 'unfetch'
import qs from 'qs'
import uuid from 'uuid-random'

import ContentTypeOptionsBuilder from './ContentOptionsBuilder'
import { addContentRequest, editContentRequest, findContentRequest, identifyAccountRequest, searchContentRequest, trackEventRequest } from './graphql';
import generateContext from './context'
import { getItem, setItem } from './storage'
import { snakeCaseKeys } from './utils'
import type { Context } from './context'
import type { ContentTypeOptions } from './ContentOptionsBuilder'

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

  contentType(
    contentType: string, options?: ContentTypeOptions
  ): ContentTypeOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeHttpRequest(
        searchContentRequest,
        { ...options, contentType }
      )
    }

    return new ContentTypeOptionsBuilder(
      (wrappedOptions) => this.makeHttpRequest(
        searchContentRequest,
        { ...wrappedOptions, contentType }
      )
    )
  }

  content(urn: string): Promise<Response> {
    if (!urn.includes('/')) {
      throw new Error('Urn must be of form: {contentType}/{content}')
    }

    const [contentType, content] = urn.split('/')
    const params = { content, contentType }

    return this.makeHttpRequest(findContentRequest, params)
  }

  addContent(urn: string, data: Record<string, any>): Promise<Response> {
    let content, contentType

    if (urn.includes('/')) {
      [content, contentType] = urn.split('/')
    } else {
      contentType = urn
    }

    const params = { content, contentType, data }

    return this.makeHttpRequest(addContentRequest, params)
  }

  editContent(urn: string, data: Record<string, any>): Promise<Response> {
    let content, contentType

    if (urn.includes('/')) {
      [content, contentType] = urn.split('/')
    } else {
      contentType = urn
    }

    let params = { content, contentType, data }

    return this.makeHttpRequest(editContentRequest, params)
  }
}

export default Client
export type { ClientParams }
