#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("My_App_Clip-Swift.h")
#import "My_App_Clip-Swift.h"
#else
#import "my-Swift.h"
#endif

@interface FaceDetectionPlugin (FrameProcessorPluginLoader)
@end

@implementation FaceDetectionPlugin (FrameProcessorPluginLoader)

+ (void)load
{
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectFace"
                                        withInitializer:^FrameProcessorPlugin*(NSDictionary* options) {
    return [[FaceDetectionPlugin alloc] initWithOptions:options];
  }];
}

@end
