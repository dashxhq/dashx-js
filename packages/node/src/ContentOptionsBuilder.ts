import type { Response } from 'got'

/* Optional Parameters? */
export type ContentOptions = {
  page: string,
  contentType: string,
  returnType?: 'all' | 'one',
  filter: Record<string, boolean | string | number>,
  order: Record<string, 'ASC' | 'DESC'>,
  limit: number
}

class ContentOptionsBuilder {
  private options: Partial<ContentOptions>
  private unwrapper: (options: ContentOptions) => Promise<Response>

  constructor(
    defaultOptions: Partial<ContentOptions>,
    unwrapper: (options: ContentOptions) => Promise<Response>
  ) {
    this.unwrapper = unwrapper
    this.options = defaultOptions
  }

  limit(by: ContentOptions['limit']) {
    this.options.limit = by
    return this
  }

  filter(by: ContentOptions['filter']) {
    this.options.filter = by
    return this
  }

  order(by: ContentOptions['order']) {
    this.options.order = by
    return this
  }

  all(withOptions: ContentOptions) {
    this.options = { ...withOptions, returnType: 'all' }
    return this.unwrapper(this.options as ContentOptions)
  }

  one(withOptions: ContentOptions) {
    this.options = { ...withOptions, returnType: 'one' }
    return this.unwrapper(this.options as ContentOptions)
  }
}

export default ContentOptionsBuilder
