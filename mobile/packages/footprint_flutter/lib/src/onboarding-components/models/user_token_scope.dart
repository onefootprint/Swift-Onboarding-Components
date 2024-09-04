enum UserTokenScope {
  signup("sign_up"),
  basicProfile("basic_profile"),
  sensitiveProfile("sensitive_profile"),
  explicitAuth("explicit_auth");

  const UserTokenScope(this.value);
  final String value;

  static UserTokenScope? fromValue(String value) {
    switch (value) {
      case "sign_up":
        return UserTokenScope.signup;
      case "basic_profile":
        return UserTokenScope.basicProfile;
      case "sensitive_profile":
        return UserTokenScope.sensitiveProfile;
      case "explicit_auth":
        return UserTokenScope.explicitAuth;
      default:
        return null;
    }
  }

  @override
  String toString() {
    return value;
  }
}
