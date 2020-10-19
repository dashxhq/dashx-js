export type ContentOptions = {
  returnType?: 'all' | 'one',
  filter?: Record<string, boolean | string | number>,
  order?: Record<string, 'ASC' | 'DESC'>,
  limit?: number,
  page?: number
}

class ContentOptionsBuilder {
  private options: ContentOptions

  private callback: (options: ContentOptions) => Promise<Response>

  constructor(
    callback: (options: ContentOptions) => Promise<Response>
  ) {
    this.options = {}
    this.callback = callback
  }

  limit(by: ContentOptions['limit']): ContentOptionsBuilder {
    this.options.limit = by
    return this
  }

  filter(by: ContentOptions['filter']): ContentOptionsBuilder {
    this.options.filter = by
    return this
  }

  order(by: ContentOptions['order']): ContentOptionsBuilder {
    this.options.order = by
    return this
  }

  all(withOptions: ContentOptions): Promise<Response> {
    this.options = { ...withOptions, returnType: 'all' }
    return this.callback(this.options)
  }

  one(withOptions: ContentOptions): Promise<Response> {
    this.options = { ...withOptions, returnType: 'one' }
    return this.callback(this.options)
  }
}

export default ContentOptionsBuilder
