import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';

class ProviderContext {
  final String publicKey;
  final OnboardingStep step;
  final String? authToken;
  final String? vaultingToken;
  final FootprintAppearance? appearance;
  final FootprintSupportedLocale? locale;
  final OnboardingConfig? onboardingConfig;
  final String redirectUrl;
  final String? sandboxId;

  ProviderContext({
    required this.publicKey,
    required this.step,
    required this.redirectUrl,
    this.authToken,
    this.vaultingToken,
    this.appearance,
    this.locale,
    this.onboardingConfig,
    this.sandboxId,
  });

  ProviderContext copyWith({
    String? publicKey,
    OnboardingStep? step,
    String? authToken,
    String? vaultingToken,
    FootprintAppearance? appearance,
    FootprintSupportedLocale? locale,
    OnboardingConfig? onboardingConfig,
    String? redirectUrl,
    String? sandboxId,
  }) {
    return ProviderContext(
      publicKey: publicKey ?? this.publicKey,
      step: step ?? this.step,
      authToken: authToken ?? this.authToken,
      vaultingToken: vaultingToken ?? this.vaultingToken,
      appearance: appearance ?? this.appearance,
      locale: locale ?? this.locale,
      onboardingConfig: onboardingConfig ?? this.onboardingConfig,
      redirectUrl: redirectUrl ?? this.redirectUrl,
      sandboxId: sandboxId ?? this.sandboxId,
    );
  }
}
