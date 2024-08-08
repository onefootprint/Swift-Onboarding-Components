import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';

class FootprintService extends InheritedWidget {
  final IdentifyLauncher launchIdentify;

  const FootprintService({
    required this.launchIdentify,
    required Widget child,
    Key? key,
  }) : super(key: key, child: child);

  static FootprintService? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FootprintService>();

  @override
  bool updateShouldNotify(FootprintService oldWidget) {
    return launchIdentify != oldWidget.launchIdentify;
  }
}
