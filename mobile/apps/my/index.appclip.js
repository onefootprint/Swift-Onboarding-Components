import { AppRegistry } from 'react-native';
import IdvApp from './src/idv-app';

global.Buffer = global.Buffer || require('buffer').Buffer;

AppRegistry.registerComponent('appclip', () => IdvApp);
