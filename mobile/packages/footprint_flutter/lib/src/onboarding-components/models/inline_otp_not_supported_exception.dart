class InlineOtpNotSupportedException implements Exception {
  final String message;

  InlineOtpNotSupportedException(this.message);

  @override
  String toString() {
    return 'InlineOtpNotSupportedException{message: $message';
  }
}
