import { AppRegistry } from 'react-native';

import App from './src/app';

global.Buffer = global.Buffer || require('buffer').Buffer;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
AppRegistry.registerComponent('main', () => App);
