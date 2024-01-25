import 'footprint_flutter_platform_interface.dart';

class FootprintConfiguration {
  final String? publicKey;
  final void Function()? onCancel;
  final Function(String)? onComplete;

  FootprintConfiguration({
    this.publicKey,
    this.onCancel,
    this.onComplete,
  });
}

class Footprint {
  void init(FootprintConfiguration config) {
    print("init footprint ${config.publicKey}");
  }
}

final footprint = Footprint();
