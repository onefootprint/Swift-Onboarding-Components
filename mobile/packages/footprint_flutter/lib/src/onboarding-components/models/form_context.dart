import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';

class FormContext {
  final FootprintBootstrapData formData;
  final FormErrors formErrors;

  FormContext({
    required this.formData,
    required this.formErrors,
  });

  FormContext copyWith({
    FootprintBootstrapData? formData,
    FormErrors? formErrors,
  }) {
    return FormContext(
      formData: formData ?? this.formData,
      formErrors: formErrors ?? this.formErrors,
    );
  }
}
