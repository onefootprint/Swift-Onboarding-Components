import 'dart:math';

String generateRandomString({
  required int length,
  bool hasSpecialCharacter = false,
}) {
  const alphanumericCharacters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const specialCharacters = '!@#\$%^&*()-=_+[]{}|;:,.<>?';
  final random = Random();

  String characters = alphanumericCharacters;
  if (hasSpecialCharacter) {
    characters += specialCharacters;
  }

  return List.generate(length, (index) {
    final randomIndex = random.nextInt(characters.length);
    return characters[randomIndex];
  }).join();
}
