# Dashx Node

_Dashx Node.js SDK_

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
const Dashx = require('@dashx/node');

// Initialize Dashx SDK
const dashx = Dashx.createClient({
  publicKey: process.env.DASHX_PUBLIC_KEY,
  privateKey: process.env.DASHX_PRIVATE_KEY,
});

// Start sending messages
dashx.deliver('message-identifier', { to: 'john@example.com' }).then(_ => console.log('Mail Sent'));
```

Can also be initialized with no parameters, `dashx-node` will look for these env variables `DASHX_PUBLIC_KEY` and `DASHX_PRIVATE_KEY`.

```javascript
const Dashx = require('@dashx/node');

// Initialize Dashx SDK
const dashx = Dashx.createClient();
```

## Examples

#### Multiple recipients

```javascript
dashx.deliver('message-identifier', {
  to: 'John Doe <john@example.com>',
  cc: ['admin@example.com', 'sales@example.com>'],
});
```

#### Template variables

```javascript
dashx.deliver('message-identifier', {
  to: 'john@example.com',
  data: { name: 'John' },
});
```

#### Attachment support

```javascript
dashx.deliver('message-identifier', {
  to: 'jane@example.com',
  attachments: [
    {
      file: '/path/to/handbook.pdf',
      name: 'Handbook',
    },
  ],
});
```

#### Use as `promise`

`dashx.deliver` returns a promise so you can chain other tasks after successfully sending mail.

```javascript
const promise = dashx.deliver('message-identifier', {
  to: 'John Doe <john@example.com>',
  cc: ['admin@example.com', 'sales@example.com>'],
});

promise
  .then(() => {
    console.log('Mail sent successfully');
    doSomething();
  })
  .catch(e => console.log('Something went wrong', e));
```

#### Use with `async/await`

```javascript
(async () => {
  try {
    await dashx.deliver('message-identifier', { to: 'john@example.com' });
  } catch (error) {
    console.log(error);
  }
})();
```
