import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';

typedef InputProps = ({
  FormFieldValidator<String>? validator,
  TextInputType? keyboardType,
  List<TextInputFormatter>? inputFormatters,
  int? maxLength,
});

typedef FieldProps = ({DataIdentifier name, InputProps? inputProps});

FieldProps getFieldProps(WidgetRef ref, DataIdentifier name) {
  final fpContext = ref.watch(fpContextNotifierProvider);

  final locale = fpContext.locale;

  if (name.name.isEmpty) {
    throw Exception('Input must be used inside a Field component');
  }

  final props = getProps(name, locale);
  if (props == null) {
    throw Exception('Field $name is not supported');
  }

  return (
    name: name,
    inputProps: props,
  );
}

Map<String, InputProps> getPersonProps(FootprintSupportedLocale? locale) {
  InputProps phoneNumberInputProps = (
    keyboardType: TextInputType.phone,
    inputFormatters: null,
    maxLength: null,
    validator: null
  );
  InputProps emailInputProps = (
    keyboardType: TextInputType.emailAddress,
    inputFormatters: null,
    maxLength: null,
    validator: null
  );

  return {
    'phoneNumber': phoneNumberInputProps,
    'email': emailInputProps,
  };
}

InputProps? getProps(DataIdentifier name, FootprintSupportedLocale? locale) {
  final personProps = getPersonProps(locale);

  switch (name) {
    case DataIdentifier.email:
      return personProps['email'];
    case DataIdentifier.phoneNumber:
      return personProps['phoneNumber'];
    default:
      return null;
  }
}
