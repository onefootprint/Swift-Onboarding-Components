import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_field_props.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/field_context.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_form.dart';

class FootprintField extends ConsumerWidget {
  final DataIdentifier name;
  final String? additionalIdentifier;
  final Widget? child;
  final Widget Function({FieldError? error})? createField;

  const FootprintField({
    required this.name,
    this.additionalIdentifier,
    this.child,
    this.createField,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (createField == null && child == null) {
      throw FootprintError(
        kind: ErrorKind.uiError,
        message: 'Either child or createField must be provided',
      );
    }
    if (createField != null && child != null) {
      throw FootprintError(
        kind: ErrorKind.uiError,
        message: 'Only one of child or createField must be provided',
      );
    }
    final props = getFieldProps(ref, name, additionalIdentifier);
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
