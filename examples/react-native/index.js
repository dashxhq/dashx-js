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
  publicKey: 'FKSLzpLhn3dL6XixRQEtkLv7',
  baseUri: 'http://api.dashx-staging.com/v1',
  trackAppLifecycleEvents: true,
  trackScreenViews: true
});

DashX.identify({ firstName: 'John', lastName: 'Doe' });

DashX.track('Added Product to Cart', {
  productId: 101,
  price: 14.99,
  size: 'large',
  isFeatured: true,
  coupon: null
});

DashX.setIdentityToken('');

AppRegistry.registerComponent(appName, () => App);
