module.exports = {
  owner: 'onefootprint',
  name: 'Footprint',
  slug: 'my',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    entitlements: {
      'com.apple.developer.associated-appclip-app-identifiers': [
        '$(AppIdentifierPrefix)undefined.Clip',
      ],
    },
    usesNonExemptEncryption: 'false',
  },
  android: {
    package: 'com.onefootprint.my',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'react-native-vision-camera',
      {
        cameraPermissionText: '$(PRODUCT_NAME) needs access to your Camera.',
      },
    ],
  ],
  extra: {
    eas: {
      build: {
        experimental: {
          ios: {
            appExtensions: [
              {
                targetName: 'myClip',
                bundleIdentifier: 'com.onefootprint.my.Clip',
                entitlements: {
                  'com.apple.developer.parent-application-identifiers': [
                    '$(AppIdentifierPrefix)com.onefootprint.my',
                  ],
                  'com.apple.developer.on-demand-install-capable': true,
                  'com.apple.developer.applesignin': ['Default'],
                },
              },
            ],
          },
        },
      },
      projectId: '6c3dfddb-d869-459d-aeec-e6bd914342c7',
    },
  },
};
