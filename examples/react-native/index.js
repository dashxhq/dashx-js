/**
 * @format
 */

import Config from 'react-native-config';
import DashX from '@dashx/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

DashX.setLogLevel(0);

DashX.setup({
  publicKey: Config.DASHX_PUBLIC_KEY,
  baseUri: 'http://api.dashx-staging.com/v1',
});

DashX.identify({ firstName: 'John', lastName: 'Doe' });
DashX.track('Hello World');

AppRegistry.registerComponent(appName, () => App);
