import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/form_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_field_props.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/field_context.dart';

class FootprintField extends ConsumerWidget {
  final String name;
  final Widget? child;
  final Widget Function({FieldError? error})? createField;

  const FootprintField({
    required this.name,
    this.child,
    this.createField,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (createField == null && child == null) {
      throw Exception("Either child or createField must be provided");
    }
    if (createField != null && child != null) {
      throw Exception("Only one of child or createField must be provided");
    }
    final props = getFieldProps(ref, name);
    if (child != null) {
      return FieldContext(
        props: props,
        child: child!,
      );
    }

    final formContext = ref.watch(formContextNotifierProvider);
    final fieldError = formContext.formErrors.errors[name];
    return FieldContext(
      props: props,
      child: createField!(error: fieldError),
    );
  }
}
