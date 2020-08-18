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
  uid?: string,
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  data?: Record<string, string | number>
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

  identify({ firstName, lastName, uid, ...others }: IdentifyParams): Promise<Response> {
    const rest = uid ? { uid, ...others } : { anonymous_uid: this.anonymousUid, ...others }

    return fetch(`${this.baseUri}/v1/identify`, {
      method: 'POST',
      headers: {
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify({
        ...rest,
        account_type: 'member',
        first_name: firstName,
        last_name: lastName
      })
    })
  }
}

export default Client
export type { ClientParams }
