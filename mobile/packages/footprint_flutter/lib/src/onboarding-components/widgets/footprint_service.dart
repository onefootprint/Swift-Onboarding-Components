import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';

class FootprintService extends InheritedWidget {
  final IdentifyLauncher launchIdentify;
  final VaultHandler vault;
  final HandoffHandler handoff;
  final AuthMethodChecker requiresAuth;
  final ProcessHandler process;
  final GetRequirementsHandler getRequirements;
  final FormData? vaultData;
  final bool isReady;

  const FootprintService({
    required this.launchIdentify,
    required this.vault,
    required this.handoff,
    required this.requiresAuth,
    required this.isReady,
    required this.process,
    required this.getRequirements,
    this.vaultData,
    required Widget child,
    Key? key,
  }) : super(key: key, child: child);

  static FootprintService? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FootprintService>();

  @override
  bool updateShouldNotify(FootprintService oldWidget) {
    return launchIdentify != oldWidget.launchIdentify ||
        vault != oldWidget.vault ||
        handoff != oldWidget.handoff ||
        requiresAuth != oldWidget.requiresAuth ||
        isReady != oldWidget.isReady ||
        process != oldWidget.process ||
        getRequirements != oldWidget.getRequirements ||
        vaultData != oldWidget.vaultData;
  }
}
