/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import DashX from '@dashx/react-native';

DashX.setLogLevel(-1);

AppRegistry.registerComponent(appName, () => App);
