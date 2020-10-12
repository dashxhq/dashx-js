import http from 'got'
import Keyv from 'keyv'
import os from 'os'
import type { Response } from 'got'

import { snakeCaseKeys } from './utils'

class HttpClient {
  private getCache: (cacheTimeout:number) => Keyv

  private cacheTimeout?: number

  private publicKey?: string

  private privateKey?: string

  private baseUri: string

  private requestQueue: { uri: string, body: any }[]

  private requestQueueLimit: number

  constructor(baseUri: string, publicKey?: string, privateKey?: string) {
    this.getCache = (cacheTimeout: number) => new Keyv(
      `sqlite://${os.tmpdir}/dashx-response-cache`, { ttl: cacheTimeout }
    )
    this.baseUri = baseUri
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.requestQueue = []
    this.requestQueueLimit = 5
  }

  create(): HttpClient {
    return new HttpClient(this.baseUri, this.publicKey, this.privateKey)
  }

  setCacheTimeout(to?: number): HttpClient {
    this.cacheTimeout = to
    return this
  }

  flushRequestQueue(): Promise<Response>[] {
    return this.requestQueue.map((request) => this.makeRequest(request.uri, request.body))
  }

  addToQueue(uri: string, body: any): Promise<any> {
    if (this.requestQueue.length > this.requestQueueLimit) {
      this.flushRequestQueue()
    }

    this.requestQueue.push({ uri, body })
    return Promise.resolve(body)
  }

  makeRequest(uri: string, body: any): Promise<Response> {
    return http(uri, {
      json: snakeCaseKeys(body),
      method: 'POST',
      prefixUrl: this.baseUri,
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
