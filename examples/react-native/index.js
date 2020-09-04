/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import DashX from '@dashx/react-native';

DashX.setLogLevel(0);

DashX.setup({
  publicKey: 'ceaTX7hJTevAKRiMe61gwZpW',
  baseUri: 'http://api.dashx-staging.com/v1',
});

DashX.identify('uid');
DashX.track('Hello World');

AppRegistry.registerComponent(appName, () => App);
