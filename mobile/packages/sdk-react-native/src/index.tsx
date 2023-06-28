import { NativeModules } from 'react-native';

const LINKING_ERROR =
  "The package 'footprint-react-native' doesn't seem to be linked";
// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const FootprintReactNativeModule = isTurboModuleEnabled
  ? require('./NativeFootprintReactNative').default
  : NativeModules.FootprintReactNative;

const FootprintReactNative =
  FootprintReactNativeModule ||
  new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    },
  );

export function multiply(a: number, b: number): Promise<number> {
  return FootprintReactNative.multiply(a, b);
}

export function multiply2(a: number, b: number): Promise<number> {
  return FootprintReactNative.multiply(a, b);
}
