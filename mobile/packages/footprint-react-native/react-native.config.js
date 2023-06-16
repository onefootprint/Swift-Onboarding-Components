module.exports = {
  dependencies: {
    'react-native-inappbrowser-reborn': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-inappbrowser-reborn/android',
        },
        ios: {
          project: '../node_modules/react-native-inappbrowser-reborn/ios/InAppBrowser.xcodeproj',
        },
      },
    },
  },
};
