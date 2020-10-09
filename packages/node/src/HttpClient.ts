import http from 'got'
import Keyv from 'keyv'
import os from 'os'
import uuid from 'uuid-random'
import type { Response } from 'got'

import { snakeCaseKeys } from './utils'

class HttpClient {
  private getCache: (cacheTimeout:number) => Keyv

  private cacheTimeout?: number

  private publicKey?: string

  private privateKey?: string

  private baseUri: string

  private exponentialBackoffBase = 2.0

  private exponentialBackoffScale = 0.5

  private jitterFactor = 0.1

  constructor(baseUri: string, publicKey?: string, privateKey?: string) {
    this.getCache = (cacheTimeout: number) => new Keyv(
      `sqlite://${os.tmpdir}/dashx-response-cache`, { ttl: cacheTimeout }
    )
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.privateKey = privateKey
  }

  create(): HttpClient {
    return new HttpClient(this.baseUri, this.publicKey, this.privateKey)
  }

  setCacheTimeout(to?: number): HttpClient {
    this.cacheTimeout = to
    return this
  }

  getRetryTimeDelay(retryCount: number): number {
    const randomFactor = 1 + (1 - Math.random() * 2) * this.jitterFactor
    return (this.exponentialBackoffBase ** retryCount * this.exponentialBackoffScale) * randomFactor
  }

  makeRequest<T>(uri: string, body: T): Promise<Response> {
    return http(uri, {
      json: snakeCaseKeys({ ...body, request_id: uuid() }),
      method: 'POST',
      prefixUrl: this.baseUri,
      retry: {
        limit: 3,
        methods: [ 'POST' ],
        calculateDelay: ({ attemptCount }) => this.getRetryTimeDelay(attemptCount),
        statusCodes: [ 408, 500, 502, 503, 504 ]
      },
      cache: this.cacheTimeout ? this.getCache(this.cacheTimeout) : false,
      headers: {
        'User-Agent': 'dashx-node',
        'X-Public-Key': this.publicKey,
        'X-Private-Key': this.privateKey,
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
  }
}

export default HttpClient
