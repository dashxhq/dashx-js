# @dashx/react-native

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

### Track Events

```javascript
DashX.track('event_name', { hello: 'world' } /* Event data */);
```
