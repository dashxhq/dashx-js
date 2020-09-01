# React Native Example App


## Setting up development environment

- Make sure you have `node` and `watchman` installed on your system, if not run these commands to install both.

```sh
brew install node
brew install watchman
```

- Install `yarn`

```sh
npm i -g yarn
```

- Install JDK, either download [Amazon Coretto](https://docs.aws.amazon.com/corretto/latest/corretto-11-ug/downloads-list.html) or install using brew.

```sh
brew cask install adoptopenjdk/openjdk/adoptopenjdk8
```

- Install Android Studio with `Android SDK > 28`, `Android Platform Tools` and `AVD`

- After installing Android Studio make sure to add these environment variables in `PATH`

```sh
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Usage

- Install dependencies using `yarn`

```sh
yarn install
```

- Run an android device from the `AVD Manager`

- Start `adb daemon` and make sure it finds your device, using:


```sh
adb devices
```

- Start Android application.

```
yarn android
```

In case of any issues please check the official [setup docs](https://reactnative.dev/docs/environment-setup).