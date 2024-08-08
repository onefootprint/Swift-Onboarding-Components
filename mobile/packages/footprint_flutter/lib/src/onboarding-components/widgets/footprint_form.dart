import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/form_context_notifier.dart';

class FootprintForm extends ConsumerStatefulWidget {
  const FootprintForm(
      {super.key, required this.onSubmit, required this.createForm});

  final void Function(FootprintBootstrapData formData) onSubmit;
  final Widget Function(void Function() handleSubmit) createForm;

  @override
  ConsumerState<FootprintForm> createState() => _FootprintFormState();
}

class _FootprintFormState extends ConsumerState<FootprintForm> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    void handleSubmit() {
      if (!_formKey.currentState!.validate()) {
        return;
      }
      _formKey.currentState!.save();
      final updatedFormData =
          ref.read(formContextNotifierProvider); // Get the most recent data
      widget.onSubmit(updatedFormData);
    }

    return Form(
      key: _formKey,
      child: widget.createForm(handleSubmit),
    );
  }
}
