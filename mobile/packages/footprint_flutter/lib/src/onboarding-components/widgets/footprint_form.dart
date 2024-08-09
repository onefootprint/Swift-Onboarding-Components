import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/form_context_notifier.dart';

typedef FormProps = ({
  FormErrors formErrors,
  void Function(String key, dynamic value) setValue
});

class FootprintForm extends ConsumerStatefulWidget {
  const FootprintForm(
      {super.key,
      required this.onSubmit,
      required this.createForm,
      this.initialData});

  final void Function(FootprintBootstrapData formData) onSubmit;
  final Widget Function(void Function() handleSubmit, FormProps props)
      createForm;
  final Map<String, dynamic>? initialData;

  @override
  ConsumerState<FootprintForm> createState() => _FootprintFormState();
}

class _FootprintFormState extends ConsumerState<FootprintForm> {
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialData != null) {
        ref.read(formContextNotifierProvider.notifier).updateFormData(
            FootprintBootstrapData.fromJson(widget.initialData!));
      }
    });
  }

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

    void setValue(String key, dynamic value) {
      ref.read(formContextNotifierProvider.notifier).setValue(key, value);
    }

    return Form(
      key: _formKey,
      child: widget.createForm(
        handleSubmit,
        (
          formErrors: formErrors,
          setValue: setValue,
        ),
      ),
    );
  }
}
