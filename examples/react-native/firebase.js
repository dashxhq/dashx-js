import Config from 'react-native-config';
import RNFirebase from '@react-native-firebase/app';

const firebase = RNFirebase.initializeApp({
  debug: true,
  persistence: true,
  APIKey: Config.FIREBASE_API_KEY,
  databaseURL: Config.FIREBASE_DATABASE_URL,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
});

export default firebase;
