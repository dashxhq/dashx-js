import uuid from 'uuid-random'

import generateContext from './context'
import { getItem, setItem } from './storage'
import type { Context } from './context'

class Dashx {
  anonymousUid: string | null = null

  context: Context

  publicKey?: string

  constructor({ publicKey = process.env.DASHX_PUBLIC_KEY }: { publicKey?: string }) {
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
}

export default Dashx
