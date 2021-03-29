import fetch from 'unfetch'
import uuid from 'uuid-random'

import ContentTypeOptionsBuilder from './ContentOptionsBuilder'
import { addContentRequest, editContentRequest, findContentRequest, identifyAccountRequest, searchContentRequest, trackEventRequest } from './graphql';
import generateContext from './context'
import { getItem, setItem } from './storage'
import type { Context } from './context'
import type { ContentTypeOptions } from './ContentOptionsBuilder'

type ClientParams = {
  publicKey: string,
  baseUri?: string
}

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

  private async makeRequest(request: string, params: any): Promise<Response> {
    const response = await fetch(this.baseUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify({
        query: request,
        variables: { input: params }
      })
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

    return this.makeRequest(identifyAccountRequest, params)
  }

  reset(): void {
    this.uid = null
    this.generateAnonymousUid(true)
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const params = { event, data, uid: this.uid, anonymous_uid: this.anonymousUid }

    return this.makeRequest(trackEventRequest, params)
  }

  contentType(
    contentType: string, options?: ContentTypeOptions
  ): ContentTypeOptionsBuilder | Promise<Response> {
    if (options) {
      return this.makeRequest(
        searchContentRequest,
        { ...options, contentType }
      )
    }

    return new ContentTypeOptionsBuilder(
      (wrappedOptions) => this.makeRequest(
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

    return this.makeRequest(findContentRequest, params)
  }

  addContent(urn: string, data: Record<string, any>): Promise<Response> {
    let content, contentType

    if (urn.includes('/')) {
      [contentType, content] = urn.split('/')
    } else {
      contentType = urn
    }

    const params = { content, contentType, data }

    return this.makeRequest(addContentRequest, params)
  }

  editContent(urn: string, data: Record<string, any>): Promise<Response> {
    let content, contentType

    if (urn.includes('/')) {
      [contentType, content] = urn.split('/')
    } else {
      contentType = urn
    }

    let params = { content, contentType, data }

    return this.makeRequest(editContentRequest, params)
  }
}

export default Client
export type { ClientParams }
