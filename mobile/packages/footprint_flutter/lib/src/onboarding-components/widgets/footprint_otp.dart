import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/challenge_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/challenge_kind.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/create_otp_challenge.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/verify_otp_challenge.dart';

typedef BuildOtpProps = ({
  Future<ChallengeKind> Function(
      {String? email, String? phoneNumber}) createOtpChallenge,
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

  Future<ChallengeKind> create({String? email, String? phoneNumber}) async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final sandboxId = fpContext.sandboxId;
    final obConfig = fpContext.onboardingConfig?.key;
    final requiredAuthMethods = fpContext.onboardingConfig?.requiredAuthMethods;
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
          authToken: authToken,
          vaultingToken: vaultingToken,
          step: OnboardingStep.onboard,
        );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: widget.buildOtp
          .call((createOtpChallenge: create, verifyOtpChallenge: verify)),
    );
  }
}
