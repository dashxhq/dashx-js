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

DashX requires Google Services installed in your app for Firebase to work.

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

- Add this line in your `/android/app/build.gradle`

```gradle
apply plugin: 'com.google.gms.google-services'
```

- Add your Android app on Firebase Console: `Project Overview > Add App > Android`

- Download `google-services.json` from there.

- Add `google-services.json` at the following location: `/android/app/google-services.json`

### Setup for iOS

- At the top of the file `/ios/{projectName}/AppDelegate.m` import Firebase:

```objective-c
#import <Firebase.h>
```

- In the same file, inside your `didFinishLaunchingWithOptions` add this:

```objective-c
if ([FIRApp defaultApp] == nil) {
  [FIRApp configure];
}
```

- In your `Podfile` add this:

```ruby
pod 'FirebaseInstanceID', :modular_headers => true
```

- Add your iOS app on Firebase Console: `Project Overview > Add App > iOS`

- Download `GoogleService-Info.plist`

- Add `GoogleService-Info.plist` using XCode by right clicking on project and select `Add Files`, select your downloaded file and make sure `Copy items if needed` is checked.

## Usage

```javascript
import DashX from '@dashx/react-native';

DashX.setup({ publicKey: 'your_public_key' });
```

`DashX.setup` accepts following properties:

|Name|Type|Default value|
|:---:|:--:|:---:|
|**`publicKey`**|`string` _(Required)_ |`null`|
|**`baseUri`**|`string`|`https://api.dashx.com/v1`|
|**`trackAppLifecycleEvents`**|`boolean`|`false`|
|**`trackScreenViews`**|`boolean`|`false`|

`trackAppLifecycleEvents` when enabled will automatically track these events:

- `Application Installed`
- `Application Updated`
- `Application Opened`
- `Application Backgrounded` with `session_length` in milliseconds.
- `Application Crashed` with `exception`.

`trackScreenViews` when enabled will send this event whenever a screen/activity is viewed:

- `Screen Viewed` with `activity_name`.

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

### Set Identity Token

In order to subcribe to push notifications you need to set identity token like so

```javascript
DashX.setIdentityToken('identity_token');
```

You can generate identity token by using `POST` `/v1/generate_token` which accepts

```json
{
  "value": "uid_here",
  "key": "dashx_private_key"
}
```
