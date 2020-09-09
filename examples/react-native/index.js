/**
 * @format
 */

import Config from 'react-native-config';
import DashX from '@dashx/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import RNFirebase from '@react-native-firebase/app';

DashX.setLogLevel(0);

DashX.setup({
  publicKey: Config.DASHX_PUBLIC_KEY,
  baseUri: 'http://api.dashx-staging.com/v1',
});

DashX.setIdentityToken(Config.DASHX_IDENTITY_TOKEN);

console.log('Firebase initialised:', !!RNFirebase.apps.length);

AppRegistry.registerComponent(appName, () => App);
