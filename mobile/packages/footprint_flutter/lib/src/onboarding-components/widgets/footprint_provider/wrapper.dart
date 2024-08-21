import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/provider_context.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/get_onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_service.dart';

class Wrapper extends ConsumerStatefulWidget {
  final Widget child;
  final FootprintAppearance? appearance;
  final String? authToken;
  final String publicKey;
  final FootprintSupportedLocale? locale;
  final String redirectUrl;
  final String? sandboxId;

  const Wrapper({
    super.key,
    required this.child,
    required this.publicKey,
    required this.redirectUrl,
    this.appearance,
    this.authToken,
    this.locale,
    this.sandboxId,
  });

  @override
  ConsumerState<Wrapper> createState() => _WrapperState();
}

class _WrapperState extends ConsumerState<Wrapper> {
  @override
  void initState() {
    super.initState();
    // we initialize the provider with the context after the first frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final currentProvider = ref.read(fpContextNotifierProvider);
      ref.read(fpContextNotifierProvider.notifier).init(
            ProviderContext(
              publicKey: widget.publicKey,
              step: widget.authToken != null
                  ? OnboardingStep.onboard
                  : OnboardingStep.auth,
              appearance: widget.appearance ?? currentProvider.appearance,
              locale: widget.locale ?? currentProvider.locale,
              onboardingConfig: null,
              authToken: widget.authToken ?? currentProvider.authToken,
              vaultingToken: null,
              redirectUrl: widget.redirectUrl,
              sandboxId: widget.sandboxId,
            ),
          );
      getOnboardingConfig(widget.publicKey).then((config) {
        ref
            .read(fpContextNotifierProvider.notifier)
            .updateOnboardingConfig(config);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final (:launchIdentify, :save, :handoff) =
        getFootprintService(context, ref);
    return FootprintService(
      launchIdentify: launchIdentify,
      save: save,
      handoff: handoff,
      child: widget.child,
    );
  }
}
