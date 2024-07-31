import 'package:flutter/material.dart';

class FootprintService extends InheritedWidget {
  final void Function() printContext;

  const FootprintService(
      {required this.printContext, required Widget child, super.key})
      : super(child: child);

  static FootprintService? of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<FootprintService>();

  @override
  bool updateShouldNotify(FootprintService oldWidget) {
    return printContext != oldWidget.printContext;
  }
}
