#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("My_App_Clip-Swift.h")
#import "My_App_Clip-Swift.h"
#else
#import "my-Swift.h"
#endif

@interface BarcodeDetectionPlugin (FrameProcessorPluginLoader)
@end

@implementation BarcodeDetectionPlugin (FrameProcessorPluginLoader)

+ (void)initialize {
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectBarcodes"
                                        withInitializer:^FrameProcessorPlugin* _Nonnull(NSDictionary* _Nullable options) {
    return [[BarcodeDetectionPlugin alloc] init];
  }];
}

@end
