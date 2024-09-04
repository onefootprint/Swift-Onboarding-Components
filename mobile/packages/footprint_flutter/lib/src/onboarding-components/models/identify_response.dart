import 'package:footprint_flutter/src/onboarding-components/models/identified_auth_method.dart';
import 'package:footprint_flutter/src/onboarding-components/models/user_token_scope.dart';

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
  final String token;
  final List<IdentifiedAuthMethod> authMethods;
  final bool isUnverified;
  final String? scrubbedEmail;
  final String? scrubbedPhone;
  final List<UserTokenScope> tokenScopes;

  UserIdentifyResponse({
    required this.token,
    required this.authMethods,
    required this.isUnverified,
    this.scrubbedEmail,
    this.scrubbedPhone,
    required this.tokenScopes,
  });

  factory UserIdentifyResponse.fromJson(Map<String, dynamic> json) {
    List<UserTokenScope> tokenScopes = [];
    if (json["token_scopes"] != null) {
      for (var tokenScope in json["token_scopes"]) {
        UserTokenScope? scope = UserTokenScope.fromValue(tokenScope);
        if (scope != null) {
          tokenScopes.add(scope);
        }
      }
    }

    List<IdentifiedAuthMethod> authMethods = [];
    if (json["auth_methods"] != null) {
      for (var authMethod in json["auth_methods"]) {
        IdentifiedAuthMethod? method =
            IdentifiedAuthMethod.fromJson(authMethod);

        authMethods.add(method);
      }
    }

    return UserIdentifyResponse(
      token: json['token'],
      authMethods: authMethods,
      isUnverified: json['is_unverified'],
      scrubbedEmail: json['scrubbed_email'],
      scrubbedPhone: json['scrubbed_phone'],
      tokenScopes: tokenScopes,
    );
  }
}
