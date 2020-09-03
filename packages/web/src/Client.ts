import fetch from 'unfetch'
import uuid from 'uuid-random'

import generateContext from './context'
import { getItem, setItem } from './storage'
import type { Context } from './context'

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

  constructor({ publicKey, baseUri = 'https://api.dashx.com/v1' }: ClientParams) {
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.context = generateContext()
    this.generateAnonymousUid()
  }

  private generateAnonymousUid(): void {
    const anonymousUid = getItem('anonymousUid')
    if (anonymousUid) {
      this.anonymousUid = anonymousUid
      return
    }

    this.anonymousUid = uuid()
    setItem('anonymousUid', this.anonymousUid)
  }

  private makeHttpRequest<T>(uri: string, body: T): Promise<Response> {
    return fetch(`${this.baseUri}/${uri}`, {
      method: 'POST',
      headers: {
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify(body)
    }).then((response) => response.json())
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
    const params = {
      anonymous_uid: this.anonymousUid,
      first_name: firstName,
      last_name: lastName,
      ...others
    }

    return this.makeHttpRequest('identify', params)
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const params = { event, data, uid: this.uid, anonymous_uid: this.anonymousUid }

    return this.makeHttpRequest('track', params)
  }
}

export default Client
export type { ClientParams }
