/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
const Dashx = require('.').default

const dx = Dashx.createClient({ publicKey: 'KF9eJ1HGMvSDkPf7hMP2H93m', privateKey: '4khLPCeK5a6LCTyuG7nr8hpieEWzm4VF' })

dx.content('contacts', {
  returnType: 'all',
  limit: 10
})
