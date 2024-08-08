import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_context.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'form_context_notifier.g.dart';

@riverpod
class FormContextNotifier extends _$FormContextNotifier {
  @override
  FormContext build() {
    return FormContext(
        formData: FootprintBootstrapData(), formErrors: FormErrors(errors: {}));
  }

  void updateFormData(FootprintBootstrapData data) {
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
