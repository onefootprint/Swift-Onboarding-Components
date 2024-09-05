import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/provider_context.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_provider/wrapper.dart';

class FootprintProvider extends StatelessWidget {
  final Widget child;
  final String publicKey;
  final FootprintAppearance? appearance;
  final String? authToken;
  final FootprintSupportedLocale? locale;
  final String redirectUrl;
  final String? sandboxId;
  final SandboxOutcome? sandboxOutcome;

  const FootprintProvider({
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
  Widget build(BuildContext context) {
    return ProviderScope(
        overrides: [
          fpContextNotifierProvider.overrideWith(
            () => FpContextNotifier(
              ProviderContext(
                publicKey: publicKey,
                appearance: appearance,
                locale: locale ?? FootprintSupportedLocale.enUS,
                authToken: authToken,
                redirectUrl: redirectUrl,
                sandboxId: sandboxId,
                sandboxOutcome: sandboxOutcome,
              ),
            ),
          ),
        ],
        child: Wrapper(
          publicKey: publicKey,
          sandboxId: sandboxId,
          sandboxOutcome: sandboxOutcome,
          child: child,
        ));
  }
}
