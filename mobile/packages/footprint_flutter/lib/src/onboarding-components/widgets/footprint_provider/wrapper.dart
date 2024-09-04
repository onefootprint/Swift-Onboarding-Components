import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
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
  final SandboxOutcome? sandboxOutcome;

  const Wrapper({
    super.key,
    required this.child,
    required this.publicKey,
    required this.redirectUrl,
    this.appearance,
    this.authToken,
    this.locale,
    this.sandboxId,
    this.sandboxOutcome,
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
      getOnboardingConfig(widget.publicKey).then((config) {
        ref
            .read(fpContextNotifierProvider.notifier)
            .updateOnboardingConfig(config);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final fpContext = ref.watch(fpContextNotifierProvider);
    final (:launchIdentify, :save, :handoff, :requiresAuth) =
        getFootprintService(context, ref);
    return FootprintService(
      launchIdentify: launchIdentify,
      save: save,
      handoff: handoff,
      requiresAuth: requiresAuth,
      isReadyForAuth: fpContext.onboardingConfig != null,
      child: widget.child,
    );
  }
}
