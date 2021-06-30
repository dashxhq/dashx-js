export const trackEventRequest = `
  mutation TrackEvent($input: TrackEventInput!) {
    trackEvent(input: $input) {
        id
    }
  }
`

export const identifyAccountRequest = `
  mutation IdentifyAccount($input: IdentifyAccountInput!) {
    identifyAccount(input: $input) {
        id
    }
  }
`

export const addContentRequest = `
  mutation AddContent($input: AddContentInput!) {
    addContent(input: $input) {
        id
        identifier
        position
        data
        createdAt
        updatedAt
    }
  }
`

export const editContentRequest = `
  mutation EditContent($input: EditContentInput!) {
    editContent(input: $input) {
        id
        identifier
        position
        data
        createdAt
        updatedAt
    }
  }
`

export const searchContentRequest = `
  query SearchContent($input: SearchContentInput!) {
    searchContent(input: $input)
  }
`

export const fetchContentRequest = `
  query FetchContent($input: FetchContentInput!) {
    fetchContent(input: $input)
  }
`

const cart = `
  id
  status
  subtotal
  discount
  tax
  total

  orderItems {
      id
      quantity
      unitPrice
      subtotal
      discount
      tax
      total
  }

  couponRedemptions {
      coupon {
          name
          identifier
          discountType
          discountAmount
          currencyCode
          expiresAt
      }
  }
`
export const addItemToCartRequest = `
  mutation AddItemToCart($input: AddItemToCartInput) {
    addItemToCart(input:$input) {
      ${cart}
    }
  }
`

export const applyCouponToCartRequest = `
  mutation ApplyCouponToCart($input: ApplyCouponToCartInput) {
    applyCouponToCart(input:$input) {
      ${cart}
    }
  }
`

export const removeCouponFromCartRequest = `
  mutation RemoveCouponFromCart($input: RemoveCouponFromCartInput) {
    removeCouponFromCart(input:$input) {
      ${cart}
    }
  }
`

export const fetchCartRequest = `
  query FetchCart($input: FetchCartInput!) {
    fetchCart(input: $input) {
      ${cart}
    }
  }
`

export const transferCartRequest = `
  query TransferCart($input: TransferCartInput!) {
    transferCart(input: $input) {
      ${cart}
    }
  }
`
