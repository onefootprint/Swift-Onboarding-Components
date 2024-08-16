import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_configuration.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/save_data_request.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/save.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/browser.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/save_utils.dart';

typedef IdentifyLauncher = void Function({
  String? email,
  String? phoneNumber,
  void Function()? onAuthenticated,
  void Function(Object err)? onError,
  void Function()? onCancel,
});

typedef SaveHandler = Future<void> Function(FormData data);
typedef HandoffHandler = void Function({
  void Function(String validationToken)? onComplete,
  void Function(Object err)? onError,
  void Function()? onCancel,
});

({IdentifyLauncher launchIdentify, SaveHandler save, HandoffHandler handoff})
    getFootprintService(BuildContext context, WidgetRef ref) {
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
      return;
    }
    final publicKey = ref.read(fpContextNotifierProvider).publicKey;
    final redirectUrl = ref.read(fpContextNotifierProvider).redirectUrl;

    final data = FormData(email: email, phoneNumber: phoneNumber);

    final config = FootprintConfiguration(
        publicKey: publicKey,
        formData: data,
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

  Future<void> vault(FormData data) async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final vaultToken = fpContext.vaultingToken;
    final onboardingConfig = fpContext.onboardingConfig;
    final locale = fpContext.locale;

    if (vaultToken == null) {
      throw Exception('No auth token found. Please authenticate first.');
    }

    if (onboardingConfig == null) {
      throw Exception(
          'No onboarding config found. Please make sure that the publicKey is correct.');
    }

    if (onboardingConfig.kind != OnboardingConfigKind.kyc &&
        onboardingConfig.kind != OnboardingConfigKind.kyb) {
      throw Exception(
          'Unsupported onboarding config kind. Please make sure that the kind is either "kyc" or "kyb".');
    }

    final formattedData = formatBeforeSave(
        data.toJson(), locale ?? FootprintSupportedLocale.enUS);

    await save(SaveDataRequest(
        data: formattedData, bootstrapDis: [], authToken: vaultToken));
  }

  void handoff({
    void Function(String validationToken)? onComplete,
    void Function(Object err)? onError,
    void Function()? onCancel,
  }) {
    final fpContext = ref.read(fpContextNotifierProvider);
    final authToken = fpContext.authToken;
    final appearance = fpContext.appearance;
    final redirectUrl = fpContext.redirectUrl;

    if (authToken == null) {
      onError
          ?.call(Exception('No auth token found. Please authenticate first.'));
      return;
    }

    final config = FootprintConfiguration(
        authToken: authToken,
        appearance: appearance,
        redirectUrl: redirectUrl,
        onComplete: (validationToken) {
          onComplete?.call(validationToken);
        },
        onError: (err) {
          onError?.call(err);
        },
        onCancel: () {
          onCancel?.call();
        });

    fpWebview.init(config, OnboardingStep.onboard, context);
  }

  return (launchIdentify: launchIdentify, save: vault, handoff: handoff);
}
