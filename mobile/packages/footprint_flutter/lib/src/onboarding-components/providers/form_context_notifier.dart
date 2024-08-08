import 'package:footprint_flutter/footprint_flutter.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'form_context_notifier.g.dart';

@riverpod
class FormContextNotifier extends _$FormContextNotifier {
  @override
  FootprintBootstrapData build() {
    return FootprintBootstrapData();
  }

  void updateData(FootprintBootstrapData data) {
    state = data;
  }

  void setValue(DataIdentifier key, dynamic value) {
    state = state.setField(key.name, value);
  }

  void reset() {
    state = build();
  }
}
