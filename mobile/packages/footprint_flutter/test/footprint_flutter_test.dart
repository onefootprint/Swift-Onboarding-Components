import 'package:flutter_test/flutter_test.dart';
import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/footprint_flutter_platform_interface.dart';
import 'package:footprint_flutter/footprint_flutter_method_channel.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

class MockFootprintFlutterPlatform
    with MockPlatformInterfaceMixin
    implements FootprintFlutterPlatform {

  @override
  Future<String?> getPlatformVersion() => Future.value('42');
}

void main() {
  final FootprintFlutterPlatform initialPlatform = FootprintFlutterPlatform.instance;

  test('$MethodChannelFootprintFlutter is the default instance', () {
    expect(initialPlatform, isInstanceOf<MethodChannelFootprintFlutter>());
  });

  test('getPlatformVersion', () async {
    FootprintFlutter footprintFlutterPlugin = FootprintFlutter();
    MockFootprintFlutterPlatform fakePlatform = MockFootprintFlutterPlatform();
    FootprintFlutterPlatform.instance = fakePlatform;

    expect(await footprintFlutterPlugin.getPlatformVersion(), '42');
  });
}
