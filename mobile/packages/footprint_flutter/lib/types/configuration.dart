import './l10n.dart';
import './user_data.dart';
import './options.dart';

class FootprintConfiguration {
  final FootprintL10n? l10n;
  final FootprintOptions? options;
  final FootprintUserData? userData;
  final Function(String)? onComplete;
  final String? authToken;
  final String? publicKey;
  final void Function()? onCancel;

  FootprintConfiguration({
    this.authToken,
    this.l10n,
    this.onCancel,
    this.onComplete,
    this.options,
    this.publicKey,
    this.userData,
  });

  Map<String, dynamic> toJson() {
    return {
      'l10n': l10n?.toJson(),
      'options': options?.toJson(),
      'public_key': publicKey,
      'user_data': userData?.toJson(),
    };
  }
}
