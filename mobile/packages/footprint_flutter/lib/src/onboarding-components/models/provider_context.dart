import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';

class ProviderContext {
  final String publicKey;
  final String? authToken;
  final String? verifiedAuthToken;
  final AuthTokenStatus? authTokenStatus;
  final String? vaultingToken;
  final String?
      authValidationToken; // This is the validation token generated from auth token, not from onboarding
  final FootprintAppearance? appearance;
  final FootprintSupportedLocale? locale;
  final OnboardingConfig? onboardingConfig;
  final String redirectUrl;
  final String? sandboxId;
  final SandboxOutcome? sandboxOutcome;
  final FormData? vaultData;

  ProviderContext({
    required this.publicKey,
    required this.redirectUrl,
    this.authToken,
    this.verifiedAuthToken,
    this.authTokenStatus,
    this.vaultingToken,
    this.authValidationToken,
    this.appearance,
    this.locale,
    this.onboardingConfig,
    this.sandboxId,
    this.sandboxOutcome,
    this.vaultData,
  });

  ProviderContext copyWith({
    String? publicKey,
    String? authToken,
    String? verifiedAuthToken,
    AuthTokenStatus? authTokenStatus,
    String? vaultingToken,
    String? authValidationToken,
    FootprintAppearance? appearance,
    FootprintSupportedLocale? locale,
    OnboardingConfig? onboardingConfig,
    String? redirectUrl,
    String? sandboxId,
    SandboxOutcome? sandboxOutcome,
    FormData? vaultData,
  }) {
    return ProviderContext(
      publicKey: publicKey ?? this.publicKey,
      authToken: authToken ?? this.authToken,
      verifiedAuthToken: verifiedAuthToken ?? this.verifiedAuthToken,
      authTokenStatus: authTokenStatus ?? this.authTokenStatus,
      vaultingToken: vaultingToken ?? this.vaultingToken,
      authValidationToken: authValidationToken ?? this.authValidationToken,
      appearance: appearance ?? this.appearance,
      locale: locale ?? this.locale,
      onboardingConfig: onboardingConfig ?? this.onboardingConfig,
      redirectUrl: redirectUrl ?? this.redirectUrl,
      sandboxId: sandboxId ?? this.sandboxId,
      sandboxOutcome: sandboxOutcome ?? this.sandboxOutcome,
      vaultData: vaultData ?? this.vaultData,
    );
  }
}
