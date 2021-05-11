# DashX Node

_DashX Node.js SDK_

<p>
  <a href="/LICENSE">
    <img src="https://badgen.net/badge/license/MIT/blue" alt="license"/>
  </a>
</p>

## Install

```sh
yarn add @dashx/node
```

## Usage

```javascript
const DashX = require('@dashx/node');

// Initialize DashX SDK
const dx = DashX.createClient({
  publicKey: process.env.DASHX_PUBLIC_KEY,
  privateKey: process.env.DASHX_PRIVATE_KEY,
});

dx.deliver({ to: 'john@example.com', body: 'Hello World!' })
  .then(_ => console.log('Mail Sent'));
```

Can also be initialized with no parameters, `dashx-node` will look for these env variables `DASHX_PUBLIC_KEY` and `DASHX_PRIVATE_KEY`.

```javascript
const DashX = require('@dashx/node');

// Initialize DashX SDK
const dx = DashX.createClient();
```

### Deliver

```javascript
dx.deliver({
  to: 'John Doe <john@example.com>',
  body: 'Hello World!'
});
```

`deliver` can accept multiple recipients like so:

```javascript
dx.deliver({
  to: ['John Doe <john@example.com>','admin@example.com', 'sales@example.com>'],
  body: 'Hello World!'
});
```

### Identify

You can use `identify` to update user info associated with the provided `uid`

```js
dx.identify('uid_of_user', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8910'
});
```

##### For Anonymous User

When you don't know the `uid` of a user, you can still use `identify` to add user info like so:

```js
dx.identify({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-234-567-8910'
});
```

`identify` will automatically append a pseudo-random `anonymous_uid` in this case.

User info can include the following keys:

|Name|Type|
|:---:|:--:|
|**`firstName`**|`string`|
|**`lastName`**|`string`|
|**`email`**|`string`|
|**`phone`**|`string`|

### Content

```javascript
dx.content('content_type', { returnType: 'all', limit: 10 } /* Content Options */)
  .then(data => console.log(data));
```

Content Options can include following properties:

|Name|Type|Example|
|:--:|:--:|:-----:|
|**`returnType`**|`'all'` or `'one'`||
|**`filter`**|`object`|`{ name_eq: 'John' }`|
|**`order`**|`object`|`{ created_at: 'DESC' }`|
|**`limit`**|`number`||
|**`page`**|`number`||

For example, to get latest contacts with name 'John' you can do:

```javascript
dx.content('contacts')
  .filter({ name_eq: 'John' })
  .order({ created_at: 'DESC' })
  .limit(10)
  .all() /* returnType */
```

This code is lazy by default and will not be executed until `.all()` or `.one()` is called.
Hence `.all()` or `.one()` should be used at the end of chain.

The above code can also be written as:

```javascript
dx.content('contacts', {
  returnType: 'all',
  filter: {
    name_eq: 'John'
  },
  order: {
    created_at: 'DESC'
  },
  limit: 10
});
```

### Track Events

```javascript
dx.track('event_name', 'uid_of_user', { hello: 'world' } /* Event data */);
```
