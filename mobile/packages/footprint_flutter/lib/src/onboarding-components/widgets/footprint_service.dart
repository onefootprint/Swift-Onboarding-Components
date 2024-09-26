import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';

class FootprintService extends InheritedWidget {
  final IdentifyLauncher launchIdentify;
  final SaveHandler save;
  final HandoffHandler handoff;
  final AuthMethodChecker requiresAuth;
  final bool isReady;

  const FootprintService({
    required this.launchIdentify,
    required this.save,
    required this.handoff,
    required this.requiresAuth,
    required this.isReady,
    required Widget child,
    Key? key,
  }) : super(key: key, child: child);

  static FootprintService? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FootprintService>();

  @override
  bool updateShouldNotify(FootprintService oldWidget) {
    return launchIdentify != oldWidget.launchIdentify ||
        save != oldWidget.save ||
        handoff != oldWidget.handoff ||
        requiresAuth != oldWidget.requiresAuth ||
        isReady != oldWidget.isReady;
  }
}
