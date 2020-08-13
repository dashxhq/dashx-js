import uuid from 'uuid-random'

import { getItem, setItem } from './storage'

class Dashx {
  anonymousUid: string | null = null

  constructor() {
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
}

export default Dashx
