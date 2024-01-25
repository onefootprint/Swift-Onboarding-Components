import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'footprint_flutter_method_channel.dart';

abstract class FootprintFlutterPlatform extends PlatformInterface {
  /// Constructs a FootprintFlutterPlatform.
  FootprintFlutterPlatform() : super(token: _token);

  static final Object _token = Object();

  static FootprintFlutterPlatform _instance = MethodChannelFootprintFlutter();

  /// The default instance of [FootprintFlutterPlatform] to use.
  ///
  /// Defaults to [MethodChannelFootprintFlutter].
  static FootprintFlutterPlatform get instance => _instance;

  /// Platform-specific implementations should set this with their own
  /// platform-specific class that extends [FootprintFlutterPlatform] when
  /// they register themselves.
  static set instance(FootprintFlutterPlatform instance) {
    PlatformInterface.verifyToken(instance, _token);
    _instance = instance;
  }

  Future<String?> getPlatformVersion() {
    throw UnimplementedError('platformVersion() has not been implemented.');
  }
}
