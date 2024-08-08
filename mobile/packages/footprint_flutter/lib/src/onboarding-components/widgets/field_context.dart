import 'package:flutter/material.dart';

class FieldContext extends InheritedWidget {
  final String name;
  final String id;

  const FieldContext({
    required this.name,
    required this.id,
    required Widget child,
    Key? key,
  }) : super(key: key, child: child);

  static FieldContext? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FieldContext>();

  @override
  bool updateShouldNotify(FieldContext oldWidget) {
    return name != oldWidget.name || id != oldWidget.id;
  }
}
