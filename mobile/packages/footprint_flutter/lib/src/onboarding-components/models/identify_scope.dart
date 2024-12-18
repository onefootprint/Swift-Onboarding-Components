enum IdentifyScope {
  auth("auth"),
  onboarding("onboarding");

  final String value;
  const IdentifyScope(this.value);

  static IdentifyScope? fromString(String value) {
    switch (value) {
      case "auth":
        return IdentifyScope.auth;
      case "onboarding":
        return IdentifyScope.onboarding;
      default:
        return null;
    }
  }

  @override
  String toString() => value;
}
