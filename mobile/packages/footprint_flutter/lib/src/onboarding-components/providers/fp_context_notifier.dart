import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/provider_context.dart';
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
      locale: null,
      onboardingConfig: null,
      authToken: null,
      vaultingToken: null,
      redirectUrl: '',
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

  void reset() {
    state = build();
  }
}
