export type ContentTypeOptions = {
  returnType?: 'all' | 'one',
  filter?: Record<string, boolean | string | number>,
  order?: Record<string, 'ASC' | 'DESC'>,
  limit?: number,
  page?: number
}

class ContentTypeOptionsBuilder {
  private options: ContentTypeOptions

  private callback: (options: ContentTypeOptions) => Promise<Response>

  constructor(
    callback: (options: ContentTypeOptions) => Promise<Response>
  ) {
    this.options = {}
    this.callback = callback
  }

  limit(by: ContentTypeOptions['limit']): ContentTypeOptionsBuilder {
    this.options.limit = by
    return this
  }

  filter(by: ContentTypeOptions['filter']): ContentTypeOptionsBuilder {
    this.options.filter = by
    return this
  }

  order(by: ContentTypeOptions['order']): ContentTypeOptionsBuilder {
    this.options.order = by
    return this
  }

  all(withOptions: ContentTypeOptions): Promise<Response> {
    this.options = { ...withOptions, returnType: 'all' }
    return this.callback(this.options)
  }

  one(withOptions: ContentTypeOptions): Promise<Response> {
    this.options = { ...withOptions, returnType: 'one' }
    return this.callback(this.options)
  }
}

export default ContentTypeOptionsBuilder
