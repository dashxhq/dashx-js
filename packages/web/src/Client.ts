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

  setContextItem<K extends keyof Context>(key: K, value: Context[K]): void {
    this.context[key] = value
  }

  identify(uid: string, options?: IdentifyParams) : Promise<Response>
  identify(options?: IdentifyParams) : Promise<Response>
  identify(
    uid: string | IdentifyParams = {}, options: IdentifyParams = {} as IdentifyParams
  ): Promise<Response> {
    let params

    if (typeof uid === 'string') {
      const { firstName, lastName, ...others } = options
      params = { uid, first_name: firstName, last_name: lastName, ...others }
    } else {
      const { firstName, lastName, ...others } = uid
      params = {
        anonymous_uid: this.anonymousUid,
        first_name: firstName,
        last_name: lastName,
        ...others
      }
    }

    return fetch(`${this.baseUri}/v1/identify`, {
      method: 'POST',
      headers: {
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify(params)
    })
      .then((response) => response.json())
      .then((data) => {
        this.uid = data.uid
        return data
      })
  }

  track(event: string, data?: Record<string, any>): Promise<Response> {
    const rest = this.uid ? { uid: this.uid } : { anonymous_uid: this.anonymousUid }

    return fetch(`${this.baseUri}/v1/track`, {
      method: 'POST',
      headers: {
        'X-Public-Key': this.publicKey
      },
      body: JSON.stringify({ event, data, ...rest })
    })
      .then((response) => response.json())
  }
}

export default Client
export type { ClientParams }
