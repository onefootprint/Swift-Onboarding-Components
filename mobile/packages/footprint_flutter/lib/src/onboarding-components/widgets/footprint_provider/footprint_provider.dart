import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_provider/wrapper.dart';

class FootprintProvider extends StatelessWidget {
  final Widget child;
  final String publicKey;
  final FootprintAppearance? appearance;
  final String? authToken;
  final FootprintSupportedLocale? locale;

  const FootprintProvider({
    super.key,
    required this.child,
    required this.publicKey,
    this.appearance,
    this.authToken,
    this.locale,
  });

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
        child: Wrapper(
      publicKey: publicKey,
      appearance: appearance,
      authToken: authToken,
      locale: locale,
      child: child,
    ));
  }
}
