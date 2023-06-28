
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNFootprintReactNativeSpec.h"

@interface FootprintReactNative : NSObject <NativeFootprintReactNativeSpec>
#else
#import <React/RCTBridgeModule.h>

@interface FootprintReactNative : NSObject <RCTBridgeModule>
#endif

@end
