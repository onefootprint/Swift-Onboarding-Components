import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/internal/auth_method.dart';
import 'package:footprint_flutter/src/onboarding-components/models/auth_token_status.dart';
import 'package:footprint_flutter/src/onboarding-components/models/challenge_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/challenge_kind.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/create_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/verify_otp_challenge.dart';

typedef BuildOtpProps = ({
  Future<ChallengeKind> Function(
      {required String email,
      required String phoneNumber}) createEmailPhoneBasedChallenge,
  Future<ChallengeKind> Function() createAuthTokenBasedChallenge,
  Future<void> Function({required String verificationCode}) verifyOtpChallenge,
});

class FootprintOtp extends ConsumerStatefulWidget {
  const FootprintOtp({super.key, required this.buildOtp});

  final Widget Function(BuildOtpProps props) buildOtp;

  @override
  ConsumerState<FootprintOtp> createState() => _FootprintOtpState();
}

class _FootprintOtpState extends ConsumerState<FootprintOtp> {
  ChallengeData? _challengeData;

  Future<ChallengeKind> createEmailPhoneBasedChallenge(
      {String? email, String? phoneNumber}) async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final sandboxId = fpContext.sandboxId;
    final obConfig = fpContext.onboardingConfig?.key;
    final requiredAuthMethods = fpContext.onboardingConfig?.requiredAuthMethods;
    final authToken = fpContext.authToken;

    final hasEmail = email != null && email.isNotEmpty;
    final hasPhoneNumber = phoneNumber != null && phoneNumber.isNotEmpty;

    if (!hasEmail && !hasPhoneNumber) {
      throw Exception('Email and/or phone number is required');
    }

    if (requiredAuthMethods?.length == 1) {
      if (requiredAuthMethods?.first == AuthMethodKind.email && !hasEmail) {
        throw Exception('Email is required');
      }
      if (requiredAuthMethods?.first == AuthMethodKind.phone &&
          !hasPhoneNumber) {
        throw Exception('Phone number is required');
      }
    }

    // If there is a valid auth token, we should not be using email/phone number
    if (authToken != null) {
      throw Exception(
          "You provided an auth token. Please authenticate using it or remove the auth token and authenticate using email/phone number");
    }
    if (obConfig == null) {
      throw Exception(
          'Onboarding config not found. Please check your public key');
    }

    final challengeResponse = await createOtpChallenge((
      email: email,
      phoneNumber: phoneNumber,
      obConfig: obConfig,
      sandboxId: sandboxId,
      requiredAuthMethods: requiredAuthMethods,
      authToken:
          null // authToken is not required here since we are using email/phone number
    ));
    if (challengeResponse.challengeData == null) {
      throw Exception('Challenge data not found');
    }
    if (challengeResponse.error != null) {
      throw Exception(challengeResponse.error);
    }
    setState(() {
      _challengeData = challengeResponse.challengeData;
    });
    return challengeResponse.challengeData!.challengeKind;
  }

  Future<ChallengeKind> createAuthTokenBasedChallenge() async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final sandboxId = fpContext.sandboxId;
    final obConfig = fpContext.onboardingConfig?.key;
    final requiredAuthMethods = fpContext.onboardingConfig?.requiredAuthMethods;
    final authToken = fpContext.authToken;
    final authTokenStatus = fpContext.authTokenStatus;
    if (obConfig == null) {
      throw Exception(
          'Onboarding config not found. Please check your public key');
    }
    if (authToken == null) {
      throw Exception(
          'Auth token not found. Please authenticate using email/phone number');
    }
    if (authTokenStatus == null) {
      throw Exception(
          'Please check the required auth methods before authenticating using auth token');
    }
    if (authTokenStatus == AuthTokenStatus.invalid) {
      throw Exception('Auth token is invalid. Please use a valid auth token');
    }
    final challengeResponse = await createOtpChallenge((
      email: null,
      phoneNumber: null,
      obConfig: obConfig,
      sandboxId: sandboxId,
      requiredAuthMethods: requiredAuthMethods,
      authToken: authToken
    ));
    if (challengeResponse.challengeData == null) {
      throw Exception('Challenge data not found');
    }
    if (challengeResponse.error != null) {
      throw Exception(challengeResponse.error);
    }
    setState(() {
      _challengeData = challengeResponse.challengeData;
    });
    return challengeResponse.challengeData!.challengeKind;
  }

  Future<void> verify({required String verificationCode}) async {
    final sandboxOutcome = ref.read(fpContextNotifierProvider).sandboxOutcome;

    if (_challengeData == null) {
      throw Exception('Challenge data not found');
    }

    final (:authToken, :vaultingToken) = await verifyOtpChallenge((
      challengeToken: _challengeData!.challengeToken,
      verificationCode: verificationCode,
      token: _challengeData!.token,
      overallOutcome: sandboxOutcome?.overallOutcome
    ));

    ref.read(fpContextNotifierProvider.notifier).update(
        verifiedAuthToken: authToken,
        vaultingToken: vaultingToken,
        authTokenStatus: AuthTokenStatus.validWithSufficientScope);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: widget.buildOtp.call((
        createEmailPhoneBasedChallenge: createEmailPhoneBasedChallenge,
        verifyOtpChallenge: verify,
        createAuthTokenBasedChallenge: createAuthTokenBasedChallenge,
      )),
    );
  }
}
