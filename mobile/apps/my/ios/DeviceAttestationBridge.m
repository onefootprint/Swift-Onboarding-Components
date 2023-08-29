  #import <React/RCTBridgeModule.h>

  @interface RCT_EXTERN_MODULE(DeviceAttestation, NSObject)

  RCT_EXTERN_METHOD(attest:(NSString *)webauthnPublicKey withChallenge:(NSString *)challenge callback:(RCTResponseSenderBlock)callback)


  @end
