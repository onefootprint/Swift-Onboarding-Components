#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("My_App_Clip-Swift.h")
#import "My_App_Clip-Swift.h"
#else
#import "my-Swift.h"
#endif

@interface DocumentDetectionPlugin (FrameProcessorPluginLoader)
@end

@implementation DocumentDetectionPlugin (FrameProcessorPluginLoader)

+ (void)load
{
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectDocument"
                                        withInitializer:^FrameProcessorPlugin*(NSDictionary* options) {
    return [[DocumentDetectionPlugin alloc] initWithOptions:options];
  }];
}

@end
