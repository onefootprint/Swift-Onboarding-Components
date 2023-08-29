#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DeviceSignals, NSObject)

RCT_EXTERN_METHOD(getSignals: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
