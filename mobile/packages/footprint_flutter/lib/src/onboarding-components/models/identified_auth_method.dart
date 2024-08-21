import 'package:footprint_flutter/src/models/internal/auth_method.dart';

class IdentifiedAuthMethod {
  final AuthMethodKind kind;
  final bool isVerified;

  IdentifiedAuthMethod({
    required this.kind,
    required this.isVerified,
  });

  factory IdentifiedAuthMethod.fromJson(Map<String, dynamic> json) {
    return IdentifiedAuthMethod(
      kind: AuthMethodKind.values.firstWhere(
        (e) => e.toString().split('.').last == json['kind'],
      ),
      isVerified: json['is_verified'],
    );
  }
}
