#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("my/my-Swift.h")
#import "my/my-Swift.h"
#else
#import "my-Swift.h"
#endif

@interface DetectBarcodesPlugin (FrameProcessorPluginLoader)
@end

@implementation DetectBarcodesPlugin (FrameProcessorPluginLoader)

+ (void)load
{
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectBarcodes"
                                        withInitializer:^FrameProcessorPlugin*(NSDictionary* options) {
    return [[DetectBarcodesPlugin alloc] initWithOptions:options];
  }];
}

@end