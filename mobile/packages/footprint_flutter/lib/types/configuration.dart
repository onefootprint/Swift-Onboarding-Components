import './l10n.dart';
import './user_data.dart';
import './options.dart';
import './appearance.dart';

class FootprintConfiguration {
  final FootprintL10n? l10n;
  final FootprintOptions? options;
  final FootprintUserData? userData;
  final Function(String)? onComplete;
  final String? authToken;
  final String? publicKey;
  final void Function()? onCancel;
  final FootprintAppearance? appearance;

  FootprintConfiguration({
    this.authToken,
    this.l10n,
    this.onCancel,
    this.onComplete,
    this.options,
    this.publicKey,
    this.userData,
    this.appearance,
  });

  Map<String, dynamic> toJson() {
    var map = {
      'l10n': l10n?.toJson(),
      'options': options?.toJson(),
      'public_key': publicKey,
      'user_data': userData?.toJson(),
      'appearance': appearance?.toJson(),
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
