import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';

class ProviderContext {
  final String publicKey;
  final OnboardingStep step;
  final String? authToken;
  final String? vaultingToken;
  final FootprintAppearance? appearance;
  final FootprintSupportedLocale? locale;
  final OnboardingConfig? onboardingConfig;

  ProviderContext({
    required this.publicKey,
    required this.step,
    this.authToken,
    this.vaultingToken,
    this.appearance,
    this.locale,
    this.onboardingConfig,
  });

  ProviderContext copyWith({
    String? publicKey,
    OnboardingStep? step,
    String? authToken,
    String? vaultingToken,
    FootprintAppearance? appearance,
    FootprintSupportedLocale? locale,
    OnboardingConfig? onboardingConfig,
  }) {
    return ProviderContext(
      publicKey: publicKey ?? this.publicKey,
      step: step ?? this.step,
      authToken: authToken ?? this.authToken,
      vaultingToken: vaultingToken ?? this.vaultingToken,
      appearance: appearance ?? this.appearance,
      locale: locale ?? this.locale,
      onboardingConfig: onboardingConfig ?? this.onboardingConfig,
    );
  }
}
