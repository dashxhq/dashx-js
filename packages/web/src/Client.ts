import uuid from 'uuid-random'
import fetch from 'unfetch'

import generateContext from './context'
import { getItem, setItem } from './storage'
import type { Context } from './context'

type ClientParams = {
  publicKey: string,
  baseUri?: string
}

type IdentifyParams = {
  uid?: string,
  firstName: string,
  lastName: string,
  email: string
}

class Client {
  anonymousUid: string | null = null

  context: Context

  publicKey: string

  baseUri: string

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

  setContextItem<K extends keyof Context>(key: K, value: Context[K]): void {
    this.context[key] = value
  }

  identify({ firstName, lastName, ...others }: IdentifyParams): Promise<Response> {
    return fetch(`${this.baseUri}/v1/identify`, {
      method: 'POST',
      headers: {
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify({
        ...others,
        anonymous_uid: this.anonymousUid,
        first_name: firstName,
        last_name: lastName
      })
    })
  }
}

export default Client
export type { ClientParams }
