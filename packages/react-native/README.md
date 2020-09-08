# @dashx/react-native

_DashX React Native SDK_

<p>
  <a href="/LICENSE">
    <img src="https://badgen.net/badge/license/MIT/blue" alt="license"/>
  </a>
</p>

## Install

```sh
# via npm
$ npm install @dashx/react-native

# via yarn
$ yarn add @dashx/react-native
```

## Usage

```javascript
import DashX from '@dashx/react-native';

DashX.setup({ publicKey: 'your_public_key' });
```

`DashX.setup` accepts following properties:

|Name|Type|
|:---:|:--:|
|**`publicKey`**|`string` _(Required)_ |
|**`baseUri`**|`string`|

By default the value of `baseUri` is `https://api.dashx.com/v1`

### Identify User

- Existing user

```javascript
DashX.identify('uid_of_user');
```

- New user

```javascript
DashX.identify({
  firstName: 'John', 
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8910'
});
```

For new user `identify()` accepts following properties:

|Name|Type|
|:---:|:--:|
|**`firstName`**|`string`|
|**`lastName`**|`string`|
|**`email`**|`string`|
|**`phone`**|`string`|

*Please note that `identify()` should not be called with `null` or `undefined`*

### Track Events

```javascript
DashX.track('event_name', { hello: 'world' } /* Event data */);
```

### Reset User

`reset()` clears out the information associated to user and hence should be called after a user logs out.

```javascript
DashX.reset()
```
