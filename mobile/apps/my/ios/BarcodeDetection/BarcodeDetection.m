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

+ (void)load
{
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectBarcodes"
                                        withInitializer:^FrameProcessorPlugin*(NSDictionary* options) {
    return [[BarcodeDetectionPlugin alloc] initWithOptions:options];
  }];
}

@end
