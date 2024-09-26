import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/provider_context.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

class FpContextNotifier extends Notifier<ProviderContext> {
  final ProviderContext initialContext;

  FpContextNotifier(this.initialContext);

  @override
  ProviderContext build() {
    return initialContext;
  }

  void init(ProviderContext context) {
    if (state.publicKey.isNotEmpty) {
      return;
    }
    state = context;
  }

  void updateAppearance(FootprintAppearance appearance) {
    state = state.copyWith(appearance: appearance);
  }

  void updateLocale(FootprintSupportedLocale locale) {
    state = state.copyWith(locale: locale);
  }

  void updateOnboardingConfig(OnboardingConfig onboardingConfig) {
    state = state.copyWith(onboardingConfig: onboardingConfig);
  }

  void updateVaultingToken(String vaultingToken) {
    state = state.copyWith(vaultingToken: vaultingToken);
  }

  void updatePublicKey(String publicKey) {
    state = state.copyWith(publicKey: publicKey);
  }

  void updateRedirectUrl(String redirectUrl) {
    state = state.copyWith(redirectUrl: redirectUrl);
  }

  void updateSandboxId(String sandboxId) {
    state = state.copyWith(sandboxId: sandboxId);
  }

  void updateSandboxOutcome(SandboxOutcome sandboxOutcome) {
    state = state.copyWith(sandboxOutcome: sandboxOutcome);
  }

  void updateVerifiedAuthToken(String verifiedAuthToken) {
    state = state.copyWith(verifiedAuthToken: verifiedAuthToken);
  }

  void updateAuthTokenStatus(AuthTokenStatus authTokenStatus) {
    state = state.copyWith(authTokenStatus: authTokenStatus);
  }

  void updateAuthValidationToken(String authValidationToken) {
    state = state.copyWith(authValidationToken: authValidationToken);
  }

  void updateVaultData(FormData vaultData) {
    state = state.copyWith(vaultData: vaultData);
  }

  void update({
    FootprintAppearance? appearance,
    FootprintSupportedLocale? locale,
    OnboardingConfig? onboardingConfig,
    String? verifiedAuthToken,
    AuthTokenStatus? authTokenStatus,
    String? vaultingToken,
    String? authValidationToken,
    String? publicKey,
    String? redirectUrl,
    String? sandboxId,
    SandboxOutcome? sandboxOutcome,
    FormData? vaultData,
  }) {
    state = state.copyWith(
      appearance: appearance,
      locale: locale,
      onboardingConfig: onboardingConfig,
      verifiedAuthToken: verifiedAuthToken,
      authTokenStatus: authTokenStatus,
      vaultingToken: vaultingToken,
      authValidationToken: authValidationToken,
      publicKey: publicKey,
      redirectUrl: redirectUrl,
      sandboxId: sandboxId,
      sandboxOutcome: sandboxOutcome,
      vaultData: vaultData,
    );
  }

  void reset() {
    state = build();
  }
}

final fpContextNotifierProvider =
    NotifierProvider<FpContextNotifier, ProviderContext>(
  () => FpContextNotifier(ProviderContext(
    publicKey: '',
    appearance: null,
    locale: FootprintSupportedLocale.enUS,
    onboardingConfig: null,
    authToken: null,
    verifiedAuthToken: null,
    authTokenStatus: null,
    vaultingToken: null,
    redirectUrl: '',
    sandboxId: null,
    sandboxOutcome: null,
    vaultData: null,
  )),
);
