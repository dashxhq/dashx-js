import { NativeEventEmitter, NativeModules } from 'react-native';

const { DashX } = NativeModules;
const dashXEventEmitter = new NativeEventEmitter(DashX);

const nativeIdentify = DashX.identify;

DashX.identify = (uid, options) => {
    if (typeof uid === "string") {
        return nativeIdentify(uid, options || null)
    } else {
        return nativeIdentify(null, uid) // options are passed as first parameter
    }
}

DashX.onMessageReceived = (callback) => dashXEventEmitter.addListener('messageReceived', callback);

const { identify, track } = DashX;

// Handle overloads at JS, because Native modules doesn't allow that
// https://github.com/facebook/react-native/issues/19116
DashX.identify = (options) => {
  if (typeof options === 'string') {
    return identify(options, null); // options is a string ie. uid
  } else {
    return identify(null, options); 
  }
};

DashX.track = (event, data) => track(event, data || null);

export default DashX;
