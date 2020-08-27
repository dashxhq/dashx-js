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

export default DashX;
