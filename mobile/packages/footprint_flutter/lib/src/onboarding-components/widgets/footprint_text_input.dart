import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/field_context.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/footprint_form.dart';

typedef CustomTextInputProps = ({
  TextInputType? keyboardType,
  TextInputAction? textInputAction,
  List<TextInputFormatter>? inputFormatters,
  List<String>? autofillHints,
  int? maxLength,
  Function(String)? onChanged,
  String? errorText,
});

typedef CustomTextInputBuilder = TextField Function(
    CustomTextInputProps inputProps);

class FootprintTextInput extends ConsumerStatefulWidget {
  const FootprintTextInput({
    super.key,
    this.focusNode,
    this.initialValue,
    this.labelText,
    this.hintText,
    this.obscureText = false,
    this.obscuringCharacter = '•',
    this.textCapitalization = TextCapitalization.none,
    this.textAlign = TextAlign.start,
    this.textAlignVertical,
    this.readOnly = false,
    this.enabled = true,
    this.maxLines,
    this.minLines,
    this.maxLengthEnforcement,
    this.scrollPadding = const EdgeInsets.all(20.0),
    this.selectionControls,
    this.autovalidateMode = AutovalidateMode.disabled,
    this.autofocus = false,
    this.prefixIcon,
    this.suffixIcon,
    this.prefix,
    this.suffix,
    this.style,
    this.cursorColor,
    this.cursorWidth = 2.0,
    this.cursorHeight,
    this.cursorRadius,
    this.onChanged,
    this.onEditingComplete,
    this.onFieldSubmitted,
    this.decoration,
    this.createCustomTextInput,
  });

  final FocusNode? focusNode;
  final String? initialValue;
  final String? labelText;
  final String? hintText;
  final bool obscureText;
  final String obscuringCharacter;
  final TextCapitalization textCapitalization;
  final TextAlign textAlign;
  final TextAlignVertical? textAlignVertical;
  final bool readOnly;
  final bool enabled;
  final int? maxLines;
  final int? minLines;
  final MaxLengthEnforcement? maxLengthEnforcement;
  final EdgeInsets scrollPadding;
  final TextSelectionControls? selectionControls;
  final AutovalidateMode autovalidateMode;
  final bool autofocus;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final Widget? prefix;
  final Widget? suffix;
  final TextStyle? style;
  final Color? cursorColor;
  final double cursorWidth;
  final double? cursorHeight;
  final Radius? cursorRadius;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String>? onFieldSubmitted;
  final InputDecoration? decoration;
  final CustomTextInputBuilder? createCustomTextInput;

  @override
  ConsumerState<FootprintTextInput> createState() => _FootprintTextInputState();
}

class _FootprintTextInputState extends ConsumerState<FootprintTextInput> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fieldProps = FieldContext.of(context)!.props;
    final (:name, :inputProps) = fieldProps;

    // Listen to form context changes and update the text field value
    // Used in case the form context is updated calling setValue in tenant code
    // or when tenant provides initial data to the form
    ref.listen(formContextNotifierProvider, (prevContext, newContext) {
      final prevValue = prevContext?.formData.toJson()[name];
      final newValue = newContext.formData.toJson()[name];
      if (prevValue != newValue && newValue is String) {
        _controller.text = newValue;
      }
    });

    final (
      :validator,
      :keyboardType,
      :textInputAction,
      :inputFormatters,
      :autofillHints,
      :maxLength,
    ) = inputProps ??
        (
          validator: null,
          keyboardType: null,
          inputFormatters: null,
          textInputAction: null,
          maxLength: null,
          autofillHints: null,
        );

    if (widget.createCustomTextInput != null) {
      return FormField(
          validator: validator,
          onSaved: (value) {
            ref
                .read(formContextNotifierProvider.notifier)
                .setValue(name, value);
          },
          key: ValueKey(name),
          builder: (FormFieldState state) {
            return widget.createCustomTextInput!((
              keyboardType: keyboardType,
              textInputAction: textInputAction,
              inputFormatters: inputFormatters,
              maxLength: maxLength,
              autofillHints: autofillHints,
              onChanged: (value) => state.didChange(value),
              errorText: state.errorText,
            ));
          });
    }

    return TextFormField(
      key: ValueKey(name),
      controller: _controller,
      focusNode: widget.focusNode,
      initialValue: widget.initialValue,
      decoration: widget.decoration ??
          InputDecoration(
            labelText: widget.labelText,
            hintText: widget.hintText,
            prefixIcon: widget.prefixIcon,
            suffixIcon: widget.suffixIcon,
            prefix: widget.prefix,
            suffix: widget.suffix,
          ),
      obscureText: widget.obscureText,
      obscuringCharacter: widget.obscuringCharacter,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      textCapitalization: widget.textCapitalization,
      textAlign: widget.textAlign,
      textAlignVertical: widget.textAlignVertical,
      readOnly: widget.readOnly,
      enabled: widget.enabled,
      maxLines: widget.maxLines,
      minLines: widget.minLines,
      maxLength: maxLength,
      maxLengthEnforcement: widget.maxLengthEnforcement,
      inputFormatters: inputFormatters,
      scrollPadding: widget.scrollPadding,
      selectionControls: widget.selectionControls,
      autovalidateMode: widget.autovalidateMode,
      autofocus: widget.autofocus,
      style: widget.style,
      cursorColor: widget.cursorColor,
      cursorWidth: widget.cursorWidth,
      cursorHeight: widget.cursorHeight,
      cursorRadius: widget.cursorRadius,
      onChanged: widget.onChanged,
      onEditingComplete: widget.onEditingComplete,
      onFieldSubmitted: widget.onFieldSubmitted,
      autofillHints: autofillHints,
      onSaved: (value) {
        ref.read(formContextNotifierProvider.notifier).setValue(name, value);
      },
      validator: validator,
    );
  }
}
