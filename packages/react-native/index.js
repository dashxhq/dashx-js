import { NativeEventEmitter, NativeModules } from 'react-native'

import ContentOptionsBuilder from './ContentOptionsBuilder'

const { DashX } = NativeModules
const dashXEventEmitter = new NativeEventEmitter(DashX)

const { identify, track, content } = DashX

// Handle overloads at JS, because Native modules doesn't allow that
// https://github.com/facebook/react-native/issues/19116
DashX.identify = (options) => {
  if (typeof options === 'string') {
    return identify(options, null) // options is a string ie. uid
  } else {
    return identify(null, options)
  }
}

DashX.track = (event, data) => track(event, data || null)

DashX.content = (contentType, options) => {
  if (options) {
    return content(contentType, options)
  }

  return new ContentOptionsBuilder(
    wrappedOptions => content(contentType, wrappedOptions)
  )
}

DashX.onMessageReceived = (callback) =>
  dashXEventEmitter.addListener('messageReceived', callback)

export default DashX
