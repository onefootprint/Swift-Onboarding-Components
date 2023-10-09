#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>

#if __has_include("my/my-Swift.h")
#import "my/my-Swift.h"
#else
#import "my-Swift.h"
#endif

@interface DetectBarcodesPlugin (FrameProcessorPluginLoader)
@end

@implementation DetectBarcodesPlugin (FrameProcessorPluginLoader)

+ (void)initialize
{
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectBarcodes"
                                        withInitializer:^FrameProcessorPlugin*(NSDictionary* options) {
    return [[DetectBarcodesPlugin alloc] initWithOptions:options];
  }];
}

@end