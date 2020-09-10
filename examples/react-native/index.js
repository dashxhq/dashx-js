/**
 * @format
 */

import Config from 'react-native-config';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import DashX from '@dashx/react-native';

DashX.setLogLevel(0);

DashX.setup({
  publicKey: Config.DASHX_PUBLIC_KEY,
  baseUri: 'http://api.dashx-staging.com/v1',
});

DashX.setIdentityToken(Config.DASHX_IDENTITY_TOKEN);

AppRegistry.registerComponent(appName, () => App);
