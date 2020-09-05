/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import DashX from '@dashx/react-native';

DashX.setLogLevel(0);

DashX.setup({
  publicKey: '1kWfBU39WyDCD7j7SkWkL8Ma',
  baseUri: 'http://api.dashx-staging.com/v1',
});

DashX.identify({ firstName: 'John' });
DashX.track('Hello World', { hello: 'world' });

AppRegistry.registerComponent(appName, () => App);
