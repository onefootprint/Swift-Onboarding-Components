import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/get_onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/generate_random_string.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_footprint_service.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/is_alphanumeric.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_service.dart';

class Wrapper extends ConsumerStatefulWidget {
  final Widget child;
  final String publicKey;
  final String? sandboxId;
  final SandboxOutcome? sandboxOutcome;

  const Wrapper({
    super.key,
    required this.child,
    required this.publicKey,
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
        if (config.kind == OnboardingConfigKind.kyb) {
          throw FootprintError(
            kind: ErrorKind.notAllowed,
            message:
                'KYB is not supported yet in the sdk. Please use the hosted flow for KYB.',
          );
        }

        if (config.isLive && widget.sandboxId != null) {
          throw FootprintError(
            kind: ErrorKind.notAllowed,
            message: 'sandboxId is not allowed in live mode',
          );
        }

        if (config.isLive && widget.sandboxOutcome != null) {
          throw FootprintError(
            kind: ErrorKind.notAllowed,
            message: 'sandboxOutcome is not allowed in live mode',
          );
        }

        if (config.requiresIdDoc == false &&
            widget.sandboxOutcome?.idDocOutcome != null) {
          throw FootprintError(
            kind: ErrorKind.notAllowed,
            message:
                'idDocOutcome is not allowed for no-document verification flow',
          );
        }

        if (!config.isLive) {
          SandboxOutcome? newSandBoxOutcome = widget.sandboxOutcome;
          String? newSandboxId = widget.sandboxId;
          if (newSandboxId != null) {
            if (!isAlphanumeric(newSandboxId)) {
              throw FootprintError(
                kind: ErrorKind.initializationError,
                message: 'sandboxId must be alphanumeric',
              );
            }
          } else {
            newSandboxId = generateRandomString(length: 12);
          }

          OverallOutcome? overallOutcome =
              newSandBoxOutcome?.overallOutcome ?? OverallOutcome.pass;
          IdDocOutcome? idDocOutcome =
              newSandBoxOutcome?.idDocOutcome ?? IdDocOutcome.pass;
          newSandBoxOutcome = SandboxOutcome(
            overallOutcome: overallOutcome,
            idDocOutcome: config.requiresIdDoc ? idDocOutcome : null,
          );
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateSandboxOutcome(newSandBoxOutcome);
          ref
              .read(fpContextNotifierProvider.notifier)
              .updateSandboxId(newSandboxId);
        }
        ref
            .read(fpContextNotifierProvider.notifier)
            .updateOnboardingConfig(config);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final fpContext = ref.watch(fpContextNotifierProvider);
    final (
      :launchIdentify,
      :vault,
      :handoff,
      :requiresAuth,
      :process,
      :getRequirements,
      :vaultData
    ) = getFootprintService(context, ref);
    return FootprintService(
      launchIdentify: launchIdentify,
      vault: vault,
      handoff: handoff,
      requiresAuth: requiresAuth,
      isReady: fpContext.onboardingConfig != null,
      process: process,
      getRequirements: getRequirements,
      vaultData: vaultData,
      child: widget.child,
    );
  }
}
