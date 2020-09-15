# DashX Node

_DashX Node.js SDK_

<p>
  <a href="/LICENSE">
    <img src="https://badgen.net/badge/license/MIT/blue" alt="license"/>
  </a>
</p>


## Install

```sh
$ yarn add @dashx/node
```

## Usage

```javascript
const DashX = require('@dashx/node');

// Initialize DashX SDK
const dashx = DashX.createClient({
  publicKey: process.env.DASHX_PUBLIC_KEY,
  privateKey: process.env.DASHX_PRIVATE_KEY,
});

dashx.deliver({ to: 'john@example.com', body: 'Hello World!' })
  .then(_ => console.log('Mail Sent'));
```

Can also be initialized with no parameters, `dashx-node` will look for these env variables `DASHX_PUBLIC_KEY` and `DASHX_PRIVATE_KEY`.

```javascript
const DashX = require('@dashx/node');

// Initialize DashX SDK
const dashx = DashX.createClient();
```

### Deliver

```javascript
dashx.deliver({
  to: 'John Doe <john@example.com>',
  body: 'Hello World!'
});
```

`deliver` can accept multiple recipients like so:

```javascript
dashx.deliver({
  to: ['John Doe <john@example.com>','admin@example.com', 'sales@example.com>'],
  body: 'Hello World!'
});
```

### Identify

- Existing User

```javascript
dashx.identify('uid_of_user', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8910'
});
```

This will override details of an existing user for the provided `uid`.

- New User

```javascript
DashX.identify({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8910'
});
```

This will create a new user with the above details.

Options can include the following keys:

|Name|Type|
|:---:|:--:|
|**`firstName`**|`string`|
|**`lastName`**|`string`|
|**`email`**|`string`|
|**`phone`**|`string`|

### Track Events

```javascript
DashX.track('event_name', 'uid_of_user', { hello: 'world' } /* Event data */);
```
