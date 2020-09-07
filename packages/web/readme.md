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

DashX.setup({ publicKey: 'your_public_key' });
```

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

*Please note that `identify()` should not be called with `null` or `undefined`*

### Track Events

```javascript
DashX.track('event_name', { hello: 'world' } /* Event data */);
```
