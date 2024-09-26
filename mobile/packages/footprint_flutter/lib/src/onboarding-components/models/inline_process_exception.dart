class InlineProcessException implements Exception {
  final String message;

  InlineProcessException(this.message);

  @override
  String toString() {
    return 'InlineProcessException{message: $message';
  }
}
