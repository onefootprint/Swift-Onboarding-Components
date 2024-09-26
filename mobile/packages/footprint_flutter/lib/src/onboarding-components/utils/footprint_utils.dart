import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_service.dart';

_FootprintUtils footprintUtils(BuildContext context) {
  final helpers = FootprintService.of(context);
  if (helpers == null) {
    throw Exception('No FootprintService found in context');
  }
  final launchIdentify = helpers.launchIdentify;
  final vault = helpers.vault;
  final handoff = helpers.handoff;
  final requiresAuth = helpers.requiresAuth;
  final isReady = helpers.isReady;
  final process = helpers.process;
  final getRequirements = helpers.getRequirements;
  final vaultData = helpers.vaultData;

  return _FootprintUtils(
    launchIdentify: launchIdentify,
    vault: vault,
    handoff: handoff,
    requiresAuth: requiresAuth,
    isReady: isReady,
    process: process,
    getRequirements: getRequirements,
    vaultData: vaultData,
  );
}

class _FootprintUtils {
  final IdentifyLauncher launchIdentify;
  final VaultHandler vault;
  final HandoffHandler handoff;
  final AuthMethodChecker requiresAuth;
  final ProcessHandler process;
  final GetRequirementsHandler getRequirements;
  final bool isReady;
  final FormData? vaultData;

  _FootprintUtils({
    required this.launchIdentify,
    required this.vault,
    required this.handoff,
    required this.requiresAuth,
    required this.isReady,
    required this.getRequirements,
    required this.process,
    this.vaultData,
  });
}
