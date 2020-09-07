# @dashx/web

_DashX JS SDK for the browser_

<p>
  <a href="/LICENSE">
    <img src="https://badgen.net/badge/license/MIT/blue" alt="license"/>
  </a>
</p>

## Install

```sh
# via npm
$ npm install @dashx/web

# via yarn
$ yarn add @dashx/web
```

## Usage

```javascript
import DashX from '@dashx/web';

const dashX = DashX({ publicKey: 'your_public_key' });
```

`DashX` constructor accepts following properties

|Name|Type|
|:--:|:---|
|**`publicKey`**|`string`|
|**`baseUri`**|`string?`|

By default the value of `baseUri` is `https://api.dashx.com/v1`

### Identify User

- Existing user

```javascript
dashX.identify('uid_of_user');
```

- New user

```javascript
dashX.identify({ 
  firstName: 'John', 
  lastName: 'Doe', 
  email: 'john@example.com', 
  phone: '+1-234-567-8910' 
});
```

For new user `identify()` accepts following properties

|Name|Type|
|:--:|:----------|
|**`firstName`**|`string?`|
|**`lastName`**|`string?`|
|**`email`**|`string?`|
|**`phone`**|`string?`|

*Please note that `identify()` should not be called with `null` or `undefined`*

### Track Events

```javascript
dashX.track('event_name', { hello: 'world' } /* Event data */);
```
