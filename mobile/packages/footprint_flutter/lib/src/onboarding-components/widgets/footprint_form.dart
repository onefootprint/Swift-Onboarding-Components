import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/form_context_notifier.dart';

class FootprintForm extends ConsumerStatefulWidget {
  const FootprintForm(
      {super.key, required this.onSubmit, required this.createForm});

  final void Function(FootprintBootstrapData formData) onSubmit;
  final Widget Function(
    void Function() handleSubmit, {
    FormErrors? formErrors,
  }) createForm;

  @override
  ConsumerState<FootprintForm> createState() => _FootprintFormState();
}

class _FootprintFormState extends ConsumerState<FootprintForm> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    final formErrors = ref.watch(formContextNotifierProvider).formErrors;
    void handleSubmit() {
      final updatedFormContext =
          ref.read(formContextNotifierProvider); // Get the most recent data
      final newFormErrors = FormErrors.build(_formKey);
      ref
          .read(formContextNotifierProvider.notifier)
          .updateFormErrors(newFormErrors); // Update the form errors
      if (newFormErrors.errors.isNotEmpty) {
        return;
      }
      _formKey.currentState!.save();
      widget.onSubmit(updatedFormContext.formData);
    }

    return Form(
      key: _formKey,
      child: widget.createForm(
        handleSubmit,
        formErrors: formErrors,
      ),
    );
  }
}
