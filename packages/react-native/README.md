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

### Setup for Android

DashX requires Google Services installed in your app in order to Firebase to work.

To install Google Services:

- Add `google-services` plugin in your `/android/build.gradle`

```gradle
buildscript {
  dependencies {
    // ... other dependencies
    classpath 'com.google.gms:google-services:4.3.3'
  }
}
```

- And then add this line in your `/android/app/build.gradle`

```gradle
apply plugin: 'com.google.gms.google-services'
```

- Add your Android app on Firebase Console.

- Download `google-services.json` from there.

- Add `google-services.json` at the following location `/android/app/google-services.json`

### Setup for ios

- Add your ios app on Firebase Console.

- Download `GoogleService-Info.plist`

- Add `GoogleService-Info.plist` using XCode by right clicking on project and select `Add Files`, select your downloaded file and make sure `Copy items if needed` is checked.

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

`reset()` clears out the information associated with a user. *Must* be called after a user logs out.

```javascript
DashX.reset();
```
