import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_configuration.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/save_data_request.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_auth_methods.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/save.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/verify_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/browser.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/save_utils.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/validate_auth_token.dart';

typedef IdentifyLauncher = void Function({
  String? email,
  String? phoneNumber,
  void Function()? onAuthenticated,
  void Function(Object err)? onError,
  void Function()? onCancel,
});
typedef AuthMethodCheckerResult = ({
  bool requiresAuth,
  FootprintAuthMethods? authMethod
});
typedef AuthMethodChecker = Future<AuthMethodCheckerResult> Function();
typedef SaveHandler = Future<void> Function(FormData data);
typedef HandoffHandler = void Function({
  void Function(String validationToken)? onComplete,
  void Function(Object err)? onError,
  void Function()? onCancel,
});

({
  IdentifyLauncher launchIdentify,
  SaveHandler save,
  HandoffHandler handoff,
  AuthMethodChecker requiresAuth
}) getFootprintService(BuildContext context, WidgetRef ref) {
  final fpWebview = Browser();

  AuthMethodCheckerResult authTokenStatusToResult(AuthTokenStatus status) {
    if (status == AuthTokenStatus.validWithSufficientScope) {
      return (requiresAuth: false, authMethod: null);
    }
    if (status == AuthTokenStatus.validWithInsufficientScope) {
      return (requiresAuth: true, authMethod: FootprintAuthMethods.authToken);
    }
    throw Exception('Invalid auth token. Please use a valid auth token.');
  }

  Future<AuthMethodCheckerResult> requiresAuth() async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final vaultingToken = fpContext.vaultingToken;
    final verifiedAuthToken = fpContext.verifiedAuthToken;
    final authToken = fpContext.authToken;
    final authTokenStatus = fpContext.authTokenStatus;

    // If we already have a vaulting token, we don't need to authenticate
    if (vaultingToken != null && vaultingToken.isNotEmpty) {
      return (requiresAuth: false, authMethod: null);
    }

    // If we have a verified auth token, we don't need to authenticate
    if (verifiedAuthToken != null && verifiedAuthToken.isNotEmpty) {
      final vaultingToken = await createVaultingToken(verifiedAuthToken);
      ref
          .read(fpContextNotifierProvider.notifier)
          .updateVaultingToken(vaultingToken.token);
      return (requiresAuth: false, authMethod: null);
    }

    // If we have an auth token, we need to check if it's valid
    if (authToken != null) {
      if (authTokenStatus == null) {
        final status = await validateAuthToken(
          ref: ref,
          publicKey: fpContext.publicKey,
          authToken: authToken,
          sandboxId: fpContext.sandboxId,
          sandboxOutcome: fpContext.sandboxOutcome,
        );
        return authTokenStatusToResult(status);
      }
      return authTokenStatusToResult(authTokenStatus);
    }

    return (requiresAuth: true, authMethod: FootprintAuthMethods.emailAndPhone);
  }

  void launchIdentify({
    String? email,
    String? phoneNumber,
    void Function()? onAuthenticated,
    void Function(Object err)? onError,
    void Function()? onCancel,
  }) {
    final publicKey = ref.read(fpContextNotifierProvider).publicKey;
    final redirectUrl = ref.read(fpContextNotifierProvider).redirectUrl;
    final sandboxOutcome = ref.read(fpContextNotifierProvider).sandboxOutcome;
    final sandboxId = ref.read(fpContextNotifierProvider).sandboxId;
    final appearance = ref.read(fpContextNotifierProvider).appearance;
    final authToken = ref.read(fpContextNotifierProvider).authToken;

    final hasEmailAndPhone = email != null && phoneNumber != null;
    final hasAuthToken = authToken != null;

    if (!hasEmailAndPhone && !hasAuthToken) {
      onError?.call(
        Exception('Please provide either email and phone or an auth token.'),
      );
      return;
    }

    if (hasEmailAndPhone && hasAuthToken) {
      onError?.call(
        Exception('Please provide either email and phone or an auth token.'),
      );
      return;
    }

    final data = FormData(email: email, phoneNumber: phoneNumber);

    final config = FootprintConfiguration(
        publicKey: publicKey,
        formData: data,
        redirectUrl: redirectUrl,
        appearance: appearance,
        sandboxOutcome: sandboxOutcome,
        sandboxId: sandboxId,
        shouldRelayToComponents: true,
        authToken: authToken,
        onAuthComplete: (
            {required String authToken, required String vaultingToken}) {
          onAuthenticated?.call();
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateVerifiedAuthToken(authToken);
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
    final authToken = fpContext.verifiedAuthToken;
    final appearance = fpContext.appearance;
    final redirectUrl = fpContext.redirectUrl;
    final sandboxId = fpContext.sandboxId;
    final sandboxOutcome = fpContext.sandboxOutcome;

    if (authToken == null) {
      onError
          ?.call(Exception('No auth token found. Please authenticate first.'));
      return;
    }

    final config = FootprintConfiguration(
        authToken: authToken,
        appearance: appearance,
        redirectUrl: redirectUrl,
        sandboxId: sandboxId,
        sandboxOutcome: sandboxOutcome,
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

  return (
    launchIdentify: launchIdentify,
    save: vault,
    handoff: handoff,
    requiresAuth: requiresAuth
  );
}
