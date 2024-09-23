import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/identify_scope.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/create_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/get_onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/validate_onboarding.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/verify_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_identify_scope_from_ob_config_kind.dart';

typedef ValidateAuthTokenResult = ({
  AuthTokenStatus authTokenStatus,
  String? validationToken,
});

Future<ValidateAuthTokenResult> handleAuthConfigKind({
  required WidgetRef ref,
  required String authToken,
}) async {
  final validationToken = (await validateOnboarding(authToken)).validationToken;
  ref.read(fpContextNotifierProvider.notifier).update(
        verifiedAuthToken: authToken,
        authTokenStatus: AuthTokenStatus.validWithSufficientScope,
        authValidationToken: validationToken,
      );
  return (
    authTokenStatus: AuthTokenStatus.validWithSufficientScope,
    validationToken: validationToken,
  );
}

Future<ValidateAuthTokenResult> handleOnboardConfigKind({
  required WidgetRef ref,
  required String authToken,
  required SandboxOutcome? sandboxOutcome,
}) async {
  final validationToken = (await getValidationToken(authToken)).validationToken;
  final vaultingToken = await createVaultingToken(authToken);
  ref.read(fpContextNotifierProvider.notifier).update(
        verifiedAuthToken: authToken,
        authTokenStatus: AuthTokenStatus.validWithSufficientScope,
        authValidationToken: validationToken,
        vaultingToken: vaultingToken.token,
      );

  await initOnboarding(authToken, sandboxOutcome?.overallOutcome);
  return (
    authTokenStatus: AuthTokenStatus.validWithSufficientScope,
    validationToken: validationToken
  );
}

Future<ValidateAuthTokenResult> validateAuthToken({
  required WidgetRef ref,
  required String publicKey,
  required String authToken,
  required String? sandboxId,
  required SandboxOutcome? sandboxOutcome,
  required OnboardingConfig? onboardingConfig,
}) async {
  OnboardingConfigKind? obConfigKind;

  if (onboardingConfig == null) {
    // Normally for other util functions, we would just throw an error if the onboardingConfig is null
    // But this function is meant to be called in the beginning right after the first frame
    // The context may not have the onboardingConfig yet
    // So we need to fetch the onboardingConfig if it is null
    final obConfig = await getOnboardingConfig(publicKey);
    ref
        .read(fpContextNotifierProvider.notifier)
        .updateOnboardingConfig(obConfig);
    obConfigKind = obConfig.kind;
  } else {
    obConfigKind = onboardingConfig.kind;
  }

  if (obConfigKind == null) {
    throw Exception('We could not determine the onboarding config kind');
  }

  final identifyScope = getIdentifyScopeFromObConfigKind(obConfigKind);

  try {
    final identifyResponse = await identify((
      obConfig: publicKey,
      authToken: authToken,
      sandboxId: sandboxId,
      email: null,
      phoneNumber: null,
      scope: identifyScope,
    ));
    final tokenScopes = identifyResponse.user?.tokenScopes;

    // TODO: technically we should check if the token scopes has the required scope
    // but that check only matters for auth method update case
    // This is the required scope mapping in FE
    //  [IdentifyVariant.auth]: [],
    //  [IdentifyVariant.updateLoginMethods]: [UserTokenScope.explicitAuth],
    //  [IdentifyVariant.verify]: [],
    // So since we are only doing "verify" in our SDK, we don't need to check for the required scope
    // We just check if the tokenScopes is not empty
    // Relevant code in FE: frontend/packages/idv/src/components/identify/components/init-auth-token/init-auth-token.tsx
    if (tokenScopes != null && tokenScopes.isNotEmpty) {
      if (identifyScope == IdentifyScope.auth) {
        return await handleAuthConfigKind(ref: ref, authToken: authToken);
      }
      return await handleOnboardConfigKind(
        ref: ref,
        authToken: authToken,
        sandboxOutcome: sandboxOutcome,
      );
    } else {
      ref
          .read(fpContextNotifierProvider.notifier)
          .updateAuthTokenStatus(AuthTokenStatus.validWithInsufficientScope);
      return (
        authTokenStatus: AuthTokenStatus.validWithInsufficientScope,
        validationToken: null
      );
    }
  } catch (e) {
    ref
        .read(fpContextNotifierProvider.notifier)
        .updateAuthTokenStatus(AuthTokenStatus.invalid);
    throw Exception('Error identifying authToken. Please check your token');
  }
}
