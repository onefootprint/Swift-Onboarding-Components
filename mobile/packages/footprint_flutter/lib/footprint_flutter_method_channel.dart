import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import 'footprint_flutter_platform_interface.dart';

/// An implementation of [FootprintFlutterPlatform] that uses method channels.
class MethodChannelFootprintFlutter extends FootprintFlutterPlatform {
  /// The method channel used to interact with the native platform.
  @visibleForTesting
  final methodChannel = const MethodChannel('footprint_flutter');

  @override
  Future<String?> getPlatformVersion() async {
    final version = await methodChannel.invokeMethod<String>('getPlatformVersion');
    return version;
  }
}
