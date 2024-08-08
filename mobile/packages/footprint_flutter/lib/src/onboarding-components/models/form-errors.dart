import 'package:flutter/material.dart';

class FormErrors {
  Map<String, FieldError> errors;

  FormErrors({required this.errors});

  factory FormErrors.build(GlobalKey<FormState> formKey) {
    if (formKey.currentState == null) {
      throw Exception('Form key does not have a current state');
    }

    final granularErrors = formKey.currentState!.validateGranularly();
    if (granularErrors.isEmpty) {
      return FormErrors(errors: {});
    }

    final errors = granularErrors.map((e) {
      final key = (e.context.widget.key as ValueKey<String>).value;
      final message = e.errorText;
      return MapEntry(key, FieldError(fieldName: key, message: message ?? ""));
    });

    return FormErrors(errors: Map.fromEntries(errors));
  }

  bool hasError(String field) {
    return errors.containsKey(field);
  }

  FieldError? getError(String field) {
    return errors[field];
  }
}

class FieldError {
  final String fieldName;
  final String message;

  FieldError({required this.fieldName, required this.message});
}
