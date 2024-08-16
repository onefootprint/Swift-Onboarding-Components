import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';

class FormContext {
  final FormData formData;
  final FormErrors formErrors;

  FormContext({
    required this.formData,
    required this.formErrors,
  });

  FormContext copyWith({
    FormData? formData,
    FormErrors? formErrors,
  }) {
    return FormContext(
      formData: formData ?? this.formData,
      formErrors: formErrors ?? this.formErrors,
    );
  }
}
