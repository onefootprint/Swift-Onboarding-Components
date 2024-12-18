enum ErrorKind {
  initializationError,
  authError,
  invalidAuthTokenError,
  userError,
  decryptionError,
  vaultingError,
  onboardingError,
  inlineProcessNotSupported,
  inlineOtpNotSupported,
  notAllowed,
  webviewError,
  uiError,
}

class FootprintError implements Exception {
  final ErrorKind kind;
  final String message;
  final String? supportId;
  final Map<String, String>? context;

  FootprintError({
    required this.kind,
    required this.message,
    this.supportId,
    this.context,
  });

  @override
  String toString() {
    String contextStr =
        context != null && context!.isNotEmpty ? ', context: $context' : '';
    return 'FootprintError(kind: $kind, message: $message$contextStr, supportId: $supportId)';
  }
}
