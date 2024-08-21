import 'package:footprint_flutter/src/onboarding-components/models/identified_auth_method.dart';

class IdentifyResponse {
  final UserIdentifyResponse? user;

  IdentifyResponse({this.user});

  factory IdentifyResponse.fromJson(Map<String, dynamic> json) {
    return IdentifyResponse(
        user: json["user"] != null
            ? UserIdentifyResponse.fromJson(json['user'])
            : null);
  }
}

class UserIdentifyResponse {
  final String? token;
  final List<IdentifiedAuthMethod>? authMethods;
  final bool? isUnverified;
  final String? scrubbedEmail;
  final String? scrubbedPhone;

  UserIdentifyResponse(
      {this.token,
      this.authMethods,
      this.isUnverified,
      this.scrubbedEmail,
      this.scrubbedPhone});

  factory UserIdentifyResponse.fromJson(Map<String, dynamic> json) {
    return UserIdentifyResponse(
        token: json['token'],
        authMethods:
            (json['auth_methods'] != null && json['auth_methods'] is List)
                ? (json['auth_methods'] as List)
                    .map((e) => IdentifiedAuthMethod.fromJson(e))
                    .toList()
                : null,
        isUnverified: json['is_unverified'],
        scrubbedEmail: json['scrubbed_email'],
        scrubbedPhone: json['scrubbed_phone']);
  }
}
