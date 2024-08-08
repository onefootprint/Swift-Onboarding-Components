import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_service.dart';

_FootprintUtils footprintUtils(BuildContext context) {
  final helpers = FootprintService.of(context);
  if (helpers == null) {
    throw Exception('No FootprintService found in context');
  }
  final launchIdentify = helpers.launchIdentify;
  final save = helpers.save;
  final handoff = helpers.handoff;

  return _FootprintUtils(
    launchIdentify: launchIdentify,
    save: save,
    handoff: handoff,
  );
}

class _FootprintUtils {
  final IdentifyLauncher launchIdentify;
  final SaveHandler save;
  final HandoffHandler handoff;

  _FootprintUtils({
    required this.launchIdentify,
    required this.save,
    required this.handoff,
  });
}
