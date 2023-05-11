import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';

const getHost = () => {
  const { scriptURL } = NativeModules.SourceCode;
  return scriptURL.split('://')[1].split(':')[0];
};

const configureLogger = () => {
  Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({ name: 'Footprint', host: getHost() })
    .useReactNative()
    .connect();
};

export default configureLogger;
