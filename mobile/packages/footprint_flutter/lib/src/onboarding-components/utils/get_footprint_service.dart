import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/browser.dart';

typedef IdentifyLauncher = void Function({
  String? email,
  String? phoneNumber,
  void Function()? onAuthenticated,
  void Function(Object err)? onError,
  void Function()? onCancel,
});

({IdentifyLauncher launchIdentify}) getFootprintService(
    BuildContext context, WidgetRef ref) {
  final fpWebview = Browser();

  void launchIdentify({
    String? email,
    String? phoneNumber,
    void Function()? onAuthenticated,
    void Function(Object err)? onError,
    void Function()? onCancel,
  }) {
    if (email == null || phoneNumber == null) {
      onError?.call(
          'Email and Phone Number are required. Email: $email, Phone Number: $phoneNumber');
    }
    final publicKey = ref.read(fpContextNotifierProvider).publicKey;
    final redirectUrl = ref.read(fpContextNotifierProvider).redirectUrl;

    final data = FootprintBootstrapData(email: email, phoneNumber: phoneNumber);

    final config = FootprintConfiguration(
        publicKey: publicKey,
        bootstrapData: data,
        redirectUrl: redirectUrl,
        onAuthComplete: (
            {required String authToken, required String vaultingToken}) {
          onAuthenticated?.call();
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateAuthToken(authToken);
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateVaultingToken(vaultingToken);
        },
        onError: (err) {
          onError?.call(err);
        },
        onCancel: () {
          onCancel?.call();
        });

    fpWebview.init(config, OnboardingStep.auth, context);
  }

  return (launchIdentify: launchIdentify);
}
