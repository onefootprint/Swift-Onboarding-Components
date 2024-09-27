import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/utils/send_sdk_telemetry.dart';

enum LogLevel {
  error,
  warn,
}

String _getStringMessage(dynamic msg) {
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

String _log(LogLevel level, dynamic message, String sdkKind) {
  final String formattedMessage = _getStringMessage(message);
  final String messageWithPrefix = '$logPrefix: $formattedMessage';

  if (debugMode) {
    final logPrefix = level == LogLevel.error ? 'ERROR' : 'WARNING';
    print('$logPrefix: $messageWithPrefix');
  } else {
    sendSdkTelemetry(formattedMessage, level.toString(), sdkKind: sdkKind);
  }

  return messageWithPrefix;
}

String logError(dynamic message, {required String sdkKind}) {
  return _log(LogLevel.error, message, sdkKind);
}

String logWarn(dynamic message, {required String sdkKind}) {
  return _log(
    LogLevel.warn,
    message,
    sdkKind,
  );
}
