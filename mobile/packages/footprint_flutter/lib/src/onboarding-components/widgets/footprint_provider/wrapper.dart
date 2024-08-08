import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/onboarding-components/models/onboarding_step.dart';
import 'package:footprint_flutter/src/onboarding-components/models/provider_context.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';

class Wrapper extends ConsumerStatefulWidget {
  final Widget child;
  final FootprintAppearance? appearance;
  final String? authToken;
  final String publicKey;
  final FootprintSupportedLocale? locale;

  const Wrapper({
    super.key,
    required this.child,
    required this.publicKey,
    this.appearance,
    this.authToken,
    this.locale,
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
      ref.read(fpContextNotifierProvider.notifier).init(
            ProviderContext(
              publicKey: widget.publicKey,
              step: widget.authToken != null
                  ? OnboardingStep.onboard
                  : OnboardingStep.auth,
              appearance: widget.appearance,
              locale: widget.locale,
              onboardingConfig: null,
              authToken: widget.authToken,
              vaultingToken: null,
            ),
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    final fpProvider = ref.watch(fpContextNotifierProvider);
    return FootprintService(
      printContext: () {
        print(fpProvider.publicKey); // TODO: remove
      },
      child: widget.child,
    );
  }
}
