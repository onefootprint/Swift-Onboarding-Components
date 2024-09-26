import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_configuration.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/inline_process_exception.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/save_data_request.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/get_onboarding_status.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/process.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/save.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/validate_onboarding.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/verify_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/browser.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_data_after_verify.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/save_utils.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/validate_auth_token.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_otp.dart';

typedef IdentifyLauncher = void Function({
  String? email,
  String? phoneNumber,
  void Function(String validationToken)? onAuthenticated,
  void Function(Object err)? onError,
  void Function()? onCancel,
});
typedef AuthMethodCheckerResult = ({
  bool requiresAuth,
  VerificationResult? verificationResult,
});
typedef AuthMethodChecker = Future<AuthMethodCheckerResult> Function();
typedef SaveHandler = Future<void> Function(FormData data);
typedef HandoffHandler = void Function({
  void Function(String validationToken)? onComplete,
  void Function(Object err)? onError,
  void Function()? onCancel,
});

typedef ProcessHandler = Future<String> Function();

({
  IdentifyLauncher launchIdentify,
  SaveHandler save,
  HandoffHandler handoff,
  AuthMethodChecker requiresAuth,
  ProcessHandler process
}) getFootprintService(BuildContext context, WidgetRef ref) {
  final fpWebview = Browser();

  bool authTokenStatusToRequiresAuthResult(AuthTokenStatus status) {
    if (status == AuthTokenStatus.validWithSufficientScope) {
      return false;
    }
    if (status == AuthTokenStatus.validWithInsufficientScope) {
      return true;
    }
    throw Exception('Invalid auth token. Please use a valid auth token.');
  }

  Future<VerificationResult> getVerificationResult({
    required String authToken,
    required String validationToken,
    required OnboardingConfigKind obConfigKind,
    required FootprintSupportedLocale locale,
  }) async {
    final (:fields, :requirements, :vaultData) =
        obConfigKind == OnboardingConfigKind.auth
            ? (
                fields: null,
                requirements: null,
                vaultData: null,
              )
            : await getDataAfterVerify(authToken, locale);
    return (
      fields: fields,
      requirements: requirements,
      validationToken: validationToken,
      vaultData: vaultData,
    );
  }

  Future<AuthMethodCheckerResult> requiresAuth() async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final vaultingToken = fpContext.vaultingToken;
    final verifiedAuthToken = fpContext.verifiedAuthToken;
    final authToken = fpContext.authToken;
    final authTokenStatus = fpContext.authTokenStatus;
    final authValidationToken = fpContext.authValidationToken;
    final obConfigKind = fpContext.onboardingConfig?.kind;
    final locale = fpContext.locale ?? FootprintSupportedLocale.enUS;
    if (obConfigKind == null) {
      throw Exception('Onboarding config kind not found');
    }

    // If we already have a vaulting token, we don't need to authenticate
    if (vaultingToken != null &&
        vaultingToken.isNotEmpty &&
        verifiedAuthToken != null) {
      return (
        requiresAuth: false,
        verificationResult: await getVerificationResult(
          authToken: verifiedAuthToken,
          validationToken: authValidationToken ?? "",
          obConfigKind: obConfigKind,
          locale: locale,
        )
      );
    }

    // If we have a verified auth token, we don't need to authenticate
    if (verifiedAuthToken != null && verifiedAuthToken.isNotEmpty) {
      if (obConfigKind != OnboardingConfigKind.auth) {
        // Only create a vaulting token if the onboarding config is not an auth config
        final vaultingToken = await createVaultingToken(verifiedAuthToken);
        ref
            .read(fpContextNotifierProvider.notifier)
            .updateVaultingToken(vaultingToken.token);
      }
      return (
        requiresAuth: false,
        verificationResult: await getVerificationResult(
          authToken: verifiedAuthToken,
          validationToken: authValidationToken ?? "",
          obConfigKind: obConfigKind,
          locale: locale,
        )
      );
    }

    // If we have an auth token, we need to check if it's valid
    if (authToken != null) {
      if (authTokenStatus == null) {
        final tokenValidationResult = await validateAuthToken(
          ref: ref,
          publicKey: fpContext.publicKey,
          authToken: authToken,
          sandboxId: fpContext.sandboxId,
          sandboxOutcome: fpContext.sandboxOutcome,
          onboardingConfig: fpContext.onboardingConfig,
        );
        final shouldAuth = authTokenStatusToRequiresAuthResult(
            tokenValidationResult.authTokenStatus);
        if (shouldAuth) {
          return (
            requiresAuth: true,
            verificationResult: null,
          );
        } else {
          return (
            requiresAuth: false,
            verificationResult: await getVerificationResult(
              authToken: authToken,
              validationToken: tokenValidationResult.validationToken ?? "",
              obConfigKind: obConfigKind,
              locale: locale,
            )
          );
        }
      }

      final shouldAuth = authTokenStatusToRequiresAuthResult(authTokenStatus);
      if (shouldAuth) {
        return (
          requiresAuth: true,
          verificationResult: null,
        );
      } else {
        return (
          requiresAuth: false,
          verificationResult: await getVerificationResult(
            authToken: authToken,
            validationToken: authValidationToken ?? "",
            obConfigKind: obConfigKind,
            locale: locale,
          )
        );
      }
    }

    return (
      requiresAuth: true,
      verificationResult: null,
    );
  }

  void launchIdentify({
    String? email,
    String? phoneNumber,
    void Function(String validationToken)? onAuthenticated,
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
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateVerifiedAuthToken(authToken);
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateAuthTokenStatus(AuthTokenStatus.validWithSufficientScope);
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateVaultingToken(vaultingToken);
          getValidationToken(authToken).then((validationToken) {
            onAuthenticated?.call(validationToken.validationToken);
          });
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

    if (onboardingConfig == null) {
      throw Exception(
          'No onboarding config found. Please make sure that the publicKey is correct and "isReady" is true.');
    }

    if (onboardingConfig.kind == OnboardingConfigKind.auth) {
      throw Exception(
          "Saving data is not allowed for auth playbooks. Please use a KYC or KYB playbook.");
    }

    if (vaultToken == null) {
      throw Exception('No auth token found. Please authenticate first.');
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
    final obConfigKind = fpContext.onboardingConfig?.kind;

    if (obConfigKind == null) {
      onError?.call(Exception('Onboarding config kind not found.'));
      return;
    }

    if (obConfigKind == OnboardingConfigKind.auth) {
      onError?.call(Exception('Handoff is not allowed for auth playbooks.'));
      return;
    }

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

  Future<String> processOnboarding() async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final authToken = fpContext.verifiedAuthToken;

    if (authToken == null) {
      throw Exception('No auth token found. Please authenticate first.');
    }

    try {
      await process(authToken);
    } catch (e) {
      throw InlineProcessException("Failed to process onboarding. Error: $e");
    }

    final requirements = await getOnboardingStatus(authToken);
    final validationToken =
        (await validateOnboarding(authToken)).validationToken;

    for (var requirement in requirements.requirements.all) {
      if (!requirement.isMet) {
        throw InlineProcessException(
            "Process error. Onboarding requirements not met.");
      }
    }

    return validationToken;
  }

  return (
    launchIdentify: launchIdentify,
    save: vault,
    handoff: handoff,
    requiresAuth: requiresAuth,
    process: processOnboarding
  );
}
