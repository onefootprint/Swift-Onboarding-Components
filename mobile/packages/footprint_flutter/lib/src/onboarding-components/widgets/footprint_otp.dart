import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/challenge_data.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/create_otp_challenge.dart';

// TODO: Implement the FootprintOtp widget completely
class FootprintOtp extends ConsumerStatefulWidget {
  const FootprintOtp({super.key, required this.buildOtp});

  final Widget Function(
      Future<void> Function({String? email, String? phoneNumber})
          createOtpChallenge) buildOtp;

  @override
  ConsumerState<FootprintOtp> createState() => _FootprintOtpState();
}

class _FootprintOtpState extends ConsumerState<FootprintOtp> {
  ChallengeData? _challengeData;

  Future<void> create({String? email, String? phoneNumber}) async {
    final fpContext = ref.read(fpContextNotifierProvider);
    final sandboxId = fpContext.sandboxId;
    final obConfig = fpContext.onboardingConfig?.key;
    if (obConfig == null) {
      throw Exception(
          'Onboarding config not found. Please check your public key');
    }
    final challengeData = await createOtpChallenge((
      email: email,
      phoneNumber: phoneNumber,
      obConfig: obConfig,
      sandboxId: sandboxId,
    ));
    setState(() {
      _challengeData = challengeData.challengeData;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: widget.buildOtp.call(create),
    );
  }
}
