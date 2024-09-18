import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/identify_scope.dart';

IdentifyScope getIdentifyScopeFromObConfigKind(OnboardingConfigKind kind) {
  if (kind == OnboardingConfigKind.auth) {
    return IdentifyScope.auth;
  }

  return IdentifyScope.onboarding;
}
