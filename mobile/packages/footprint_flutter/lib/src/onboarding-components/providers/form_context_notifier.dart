import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_context.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

class FormContextNotifier extends Notifier<FormContext> {
  @override
  FormContext build() {
    return FormContext(
        formData: FormData(), formErrors: FormErrors(errors: {}));
  }

  void updateFormData(FormData data) {
    state = state.copyWith(formData: data);
  }

  void setValue(String key, dynamic value) {
    state = state.copyWith(formData: state.formData.setField(key, value));
  }

  void updateFormErrors(FormErrors errors) {
    state = state.copyWith(formErrors: errors);
  }

  void reset() {
    state = build();
  }
}
