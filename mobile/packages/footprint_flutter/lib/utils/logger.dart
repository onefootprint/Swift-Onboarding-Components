import 'dart:convert';
part of '../footprint_flutter.dart';

enum LogLevel {
  error,
  warn,
}

String getStringMessage(dynamic msg) {
  if (msg is String) {
    return msg;
  }
  if (msg is! Object) {
    return 'Something went wrong';
  }
  if (msg is Error) {
    return msg.toString();
  }
  try {
    return jsonEncode(msg);
  } catch (e) {
    // Do nothing
  }
  return 'Something went wrong';
}

String _log(LogLevel level, dynamic message) {
  final String formattedMessage = getStringMessage(message);
  final String messageWithPrefix = '$_logPrefix: $formattedMessage';

  if (_debugMode) {
    final logPrefix = level == LogLevel.error ? 'ERROR' : 'WARNING';
    print('$logPrefix: $messageWithPrefix');
  } else {
    _sendSdkTelemetry(formattedMessage, level.toString());
  }

  return messageWithPrefix;
}

String _logError(dynamic message) {
  return _log(LogLevel.error, message);
}

String _logWarn(dynamic message) {
  return _log(LogLevel.warn, message);
}