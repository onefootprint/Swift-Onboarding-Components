import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/models/options.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'package:meta/meta.dart';

class Configuration {
  final FootprintAppearance? appearance;
  final FootprintL10n? l10n;
  final FootprintOptions? options;
  final Function(String)? onComplete;
  final Function({required String authToken, required String vaultingToken})?
      onAuthComplete;
  final Function(Object)? onError;
  final SandboxOutcome? sandboxOutcome;
  final String? sandboxId;
  final String? authToken;
  final String? publicKey;
  final String redirectUrl;
  final void Function()? onCancel;

  Configuration({
    this.appearance,
    this.authToken,
    this.l10n,
    this.onCancel,
    this.onComplete,
    this.onAuthComplete,
    this.onError,
    this.sandboxOutcome,
    this.sandboxId,
    this.options,
    this.publicKey,
    required this.redirectUrl,
  });

  @internal
  Map<String, dynamic> toJson() {
    print("toJson in Configuration");
    var map = {
      'l10n': l10n?.toJson(),
      'options': options?.toJson(),
      'auth_token': authToken,
      'public_key': publicKey,
      'appearance': appearance?.toJson(),
      "fixture_result": sandboxOutcome?.overallOutcome?.toString(),
      "document_fixture_result": sandboxOutcome?.idDocOutcome?.toString(),
      "sandbox_id": sandboxId,
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
