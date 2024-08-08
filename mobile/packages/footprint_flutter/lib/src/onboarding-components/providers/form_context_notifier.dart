import 'package:footprint_flutter/src/models/bootstrap_data.dart';
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

  void setValue(String key, dynamic value) {
    state = state.setField(key, value);
  }

  void reset() {
    state = build();
  }
}
