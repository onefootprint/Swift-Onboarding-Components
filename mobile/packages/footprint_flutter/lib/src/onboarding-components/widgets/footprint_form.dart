import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form-errors.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_context.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/form_context_notifier.dart';

typedef FormProps = ({
  FormErrors formErrors,
  void Function(String key, dynamic value) setValue
});

final formContextNotifierProvider =
    NotifierProvider<FormContextNotifier, FormContext>(
        () => FormContextNotifier());

class FootprintForm extends StatelessWidget {
  final void Function(FormData formData) onSubmit;
  final Widget Function(void Function() handleSubmit, FormProps props)
      createForm;
  final Map<DataIdentifier, dynamic>? initialData;

  const FootprintForm({
    required this.onSubmit,
    required this.createForm,
    this.initialData,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      overrides: [
        formContextNotifierProvider.overrideWith(
          () => FormContextNotifier(),
        ),
      ],
      child: FormWrapper(
        onSubmit: onSubmit,
        createForm: createForm,
        initialData: initialData,
      ),
    );
  }
}

class FormWrapper extends ConsumerStatefulWidget {
  const FormWrapper(
      {super.key,
      required this.onSubmit,
      required this.createForm,
      this.initialData});

  final void Function(FormData formData) onSubmit;
  final Widget Function(void Function() handleSubmit, FormProps props)
      createForm;
  final Map<DataIdentifier, dynamic>? initialData;

  @override
  ConsumerState<FormWrapper> createState() => _FootprintFormState();
}

class _FootprintFormState extends ConsumerState<FormWrapper> {
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialData != null) {
        // convert dataIdentifier to string
        var stringKeyInitialData = widget.initialData!.map((key, value) {
          return MapEntry(key.toString(), value);
        });

        ref
            .read(formContextNotifierProvider.notifier)
            .updateFormData(FormData.fromJson(stringKeyInitialData));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final formErrors = ref.watch(formContextNotifierProvider).formErrors;
    void handleSubmit() {
      final newFormErrors = FormErrors.build(_formKey);
      ref
          .read(formContextNotifierProvider.notifier)
          .updateFormErrors(newFormErrors); // Update the form errors
      if (newFormErrors.errors.isNotEmpty) {
        return;
      }
      _formKey.currentState!.save();
      final updatedFormContext =
          ref.read(formContextNotifierProvider); // Get the most recent data
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
