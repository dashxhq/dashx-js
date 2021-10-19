/**
 * @format
 */

import Config from 'react-native-config';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import DashX from '@dashx/react-native';

// DashX.setLogLevel(0);

// DashX.setup({
//   publicKey: Config.DASHX_PUBLIC_KEY,
//   baseUri: 'http://api.dashx-local.com:8080/graphql',
//   accountType: 'individual',
// });

// DashX.identify({ firstName: 'John', lastName: 'Doe' });

// DashX.track('Added Product to Cart', {
//   productId: 101,
//   price: 14.99,
//   isFeatured: true,
//   coupon: null
// });

// DashX.contentType('page').all().then(console.log);
// DashX.content('page/some').then(console.log);
// DashX.editContent('page/some', { "hello": "world" }).then(console.log);

DashX.setLogLevel(0)
DashX.setup({
  publicKey: 'qCNy89yJgkz2YyllvPJ93JlB',
  // trackAppLifecycleEvents: true,
  // trackScreenViews: true,
  targetEnvironment: 'production'
})
DashX.fetchContent('screen/all-masterclasses')
.then(x => console.log(x.title))
  .catch(console.log)
DashX.searchContent('screen')
.filter({ route: { eq: `/masterclasses/all` } })
.all()
.then(x => x.map(x => console.log("SearchContent", x.title)))
.catch(console.log)
DashX.searchContent('screen')
.filter({ route: { eq: `/masterclasses/all` } })
.one()
.then(x => console.log("SearchContent 2", JSON.stringify(x.blocks)))
.catch(console.log)
DashX.searchContent('screen', {
  returnType: 'one',
  filter: { route: { eq: `/masterclasses/my` } }
})
.then(x => console.log("SearchContent 3", x.title))
.catch(console.log)

AppRegistry.registerComponent(appName, () => App);
