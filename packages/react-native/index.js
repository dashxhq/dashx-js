import { NativeModules } from 'react-native';

const { DashX } = NativeModules;

const { identify, track } = DashX;

// Handle overloads at JS, because Native modules doesn't allow that
// https://github.com/facebook/react-native/issues/19116
DashX.identify = (uid, options) => {
  if (typeof uid === 'string') {
    return identify(uid, options || null);
  } else {
    return identify(null, uid); // options are passed as first parameter
  }
};

DashX.track = (event, data) => track(event, data || null);

export default DashX;
