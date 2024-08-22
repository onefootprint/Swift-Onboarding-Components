import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/provider_context.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'fp_context_notifier.g.dart';

@riverpod
class FpContextNotifier extends _$FpContextNotifier {
  @override
  ProviderContext build() {
    return ProviderContext(
      publicKey: '',
      step: OnboardingStep.auth,
      appearance: null,
      locale: FootprintSupportedLocale.enUS,
      onboardingConfig: null,
      authToken: null,
      vaultingToken: null,
      redirectUrl: '',
      sandboxId: null,
      sandboxOutcome: null,
    );
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

  void updateStep(OnboardingStep step) {
    state = state.copyWith(step: step);
  }

  void updateAuthToken(String authToken) {
    state = state.copyWith(authToken: authToken);
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

  void update({
    FootprintAppearance? appearance,
    FootprintSupportedLocale? locale,
    OnboardingConfig? onboardingConfig,
    OnboardingStep? step,
    String? authToken,
    String? vaultingToken,
    String? publicKey,
    String? redirectUrl,
    String? sandboxId,
    SandboxOutcome? sandboxOutcome,
  }) {
    state = state.copyWith(
      appearance: appearance,
      locale: locale,
      onboardingConfig: onboardingConfig,
      step: step,
      authToken: authToken,
      vaultingToken: vaultingToken,
      publicKey: publicKey,
      redirectUrl: redirectUrl,
      sandboxId: sandboxId,
      sandboxOutcome: sandboxOutcome,
    );
  }

  void reset() {
    state = build();
  }
}
