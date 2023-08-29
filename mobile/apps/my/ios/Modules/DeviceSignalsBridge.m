#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DeviceSignals, NSObject)

RCT_EXTERN_METHOD(getSignals: (NSString *)webauthnPublicKey footprintAttestationChallenge:(NSString *)footprintAttestationChallenge callback:(RCTResponseSenderBlock)callback)

@end
