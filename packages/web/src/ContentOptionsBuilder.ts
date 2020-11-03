export type ContentOptions = {
  exclude?: string[],
  fields?: string[],
  filter?: Record<string, boolean | string | number>,
  include?: string[],
  limit?: number,
  page?: number,
  order?: Record<string, 'ASC' | 'DESC'>,
  preview?: boolean,
  returnType?: 'all' | 'one'
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

  preview(): ContentOptionsBuilder {
    this.options.preview = true
    return this
  }

  include(...fields: string[]): ContentOptionsBuilder {
    this.options.include = fields
    return this
  }

  exclude(...fields: string[]): ContentOptionsBuilder {
    this.options.exclude = fields
    return this
  }

  fields(...names: string[]): ContentOptionsBuilder {
    this.options.fields = names
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
