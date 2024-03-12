export enum ScreenState {
  collect = 'collect',
  verify = 'verify',
}

export const isCollectScreen = (x: unknown) => x === ScreenState.collect;
