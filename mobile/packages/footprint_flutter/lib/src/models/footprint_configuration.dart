import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/models/internal/configuration.dart';
import 'package:meta/meta.dart';

class FootprintConfiguration extends Configuration {
  final FootprintBootstrapData? bootstrapData;

  FootprintConfiguration({
    super.appearance,
    super.authToken,
    super.l10n,
    super.onCancel,
    super.onComplete,
    super.onAuthComplete,
    super.onError,
    super.options,
    super.publicKey,
    super.sandboxId,
    super.sandboxOutcome,
    super.isAuthPlaybook,
    required super.redirectUrl,
    this.bootstrapData,
  });

  @override
  @internal
  Map<String, dynamic> toJson() {
    var map = {
      'l10n': l10n?.toJson(),
      'options': options?.toJson(),
      'auth_token': authToken,
      'public_key': publicKey,
      'user_data': bootstrapData?.toJson(),
      'appearance': appearance?.toJson(),
      "fixture_result": sandboxOutcome?.overallOutcome?.toString(),
      "document_fixture_result": sandboxOutcome?.idDocOutcome?.toString(),
      "sandbox_id": sandboxId,
      "is_auth_playbook": isAuthPlaybook,
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
