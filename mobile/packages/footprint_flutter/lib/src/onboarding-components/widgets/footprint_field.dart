import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_field_props.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/field_context.dart';

class FootprintField extends ConsumerWidget {
  final DataIdentifier name;
  final Widget child;

  const FootprintField({
    required this.name,
    required this.child,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final props = getFieldProps(ref, name);
    return FieldContext(
      props: props,
      child: child,
    );
  }
}
