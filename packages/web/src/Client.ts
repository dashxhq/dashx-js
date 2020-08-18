import uuid from 'uuid-random'

import generateContext from './context'
import { getItem, setItem } from './storage'
import type { Context } from './context'

class Client {
  anonymousUid: string | null = null

  context: Context

  constructor() {
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
}

export default Client
