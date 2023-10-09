#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>

#if __has_include("My_App_Clip-Swift.h")
#import "My_App_Clip-Swift.h"
#else
#import "my-Swift.h"
#endif

@interface FaceDetectionPlugin (FrameProcessorPluginLoader)
@end

@implementation FaceDetectionPlugin (FrameProcessorPluginLoader)

+ (void)initialize {
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"detectFace"
                                        withInitializer:^FrameProcessorPlugin* _Nonnull(NSDictionary* _Nullable options) {
    return [[FaceDetectionPlugin alloc] init];
  }];
}

@end


