import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/field_context.dart';

class FootprintField extends StatelessWidget {
  final String name;
  final String id;
  final Widget child;

  const FootprintField({
    required this.name,
    required this.id,
    required this.child,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FieldContext(
      name: name,
      id: id,
      child: child,
    );
  }
}
