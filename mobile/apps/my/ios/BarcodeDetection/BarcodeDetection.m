#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("My_App_Clip-Swift.h")
#import "My_App_Clip-Swift.h"
#else
#import "my-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(BarcodeDetectionPlugin, detectBarcodes)
