import 'package:flutter/material.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/get_field_props.dart';

class FieldContext extends InheritedWidget {
  final FieldProps props;

  const FieldContext({
    required this.props,
    required Widget child,
    Key? key,
  }) : super(key: key, child: child);

  static FieldContext? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FieldContext>();

  @override
  bool updateShouldNotify(FieldContext oldWidget) {
    return props != oldWidget.props;
  }
}
