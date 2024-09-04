import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/create_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/verify_otp_challenge.dart';

Future<AuthTokenStatus> validateAuthToken({
  required WidgetRef ref,
  required String publicKey,
  required String authToken,
  required String? sandboxId,
  required SandboxOutcome? sandboxOutcome,
}) async {
  try {
    final identifyResponse = await identify((
      obConfig: publicKey,
      authToken: authToken,
      sandboxId: sandboxId,
      email: null,
      phoneNumber: null,
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
      ref.read(fpContextNotifierProvider.notifier).update(
            verifiedAuthToken: authToken,
            authTokenStatus: AuthTokenStatus.validWithSufficientScope,
          );
      await getValidationToken(authToken);
      await initOnboarding(authToken, sandboxOutcome?.overallOutcome);
      final vaultingToken = await createVaultingToken(authToken);
      ref
          .read(fpContextNotifierProvider.notifier)
          .updateVaultingToken(vaultingToken.token);
      return AuthTokenStatus.validWithSufficientScope;
    } else {
      ref
          .read(fpContextNotifierProvider.notifier)
          .updateAuthTokenStatus(AuthTokenStatus.validWithInsufficientScope);
      return AuthTokenStatus.validWithInsufficientScope;
    }
  } catch (e) {
    ref
        .read(fpContextNotifierProvider.notifier)
        .updateAuthTokenStatus(AuthTokenStatus.invalid);
    throw Exception('Error identifying authToken. Please check your token');
  }
}
