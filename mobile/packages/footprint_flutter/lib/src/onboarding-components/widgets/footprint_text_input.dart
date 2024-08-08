import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/form_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/widgets/field_context.dart';

class FootprintTextInput extends ConsumerWidget {
  const FootprintTextInput({
    super.key,
    this.controller,
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
  });

  final TextEditingController? controller;
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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fieldProps = FieldContext.of(context)!.props;
    final (:name, :inputProps) = fieldProps;
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

    return TextFormField(
      controller: controller,
      focusNode: focusNode,
      initialValue: initialValue,
      decoration: decoration ??
          InputDecoration(
            labelText: labelText,
            hintText: hintText,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            prefix: prefix,
            suffix: suffix,
          ),
      obscureText: obscureText,
      obscuringCharacter: obscuringCharacter,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      textCapitalization: textCapitalization,
      textAlign: textAlign,
      textAlignVertical: textAlignVertical,
      readOnly: readOnly,
      enabled: enabled,
      maxLines: maxLines,
      minLines: minLines,
      maxLength: maxLength,
      maxLengthEnforcement: maxLengthEnforcement,
      inputFormatters: inputFormatters,
      scrollPadding: scrollPadding,
      selectionControls: selectionControls,
      autovalidateMode: autovalidateMode,
      autofocus: autofocus,
      style: style,
      cursorColor: cursorColor,
      cursorWidth: cursorWidth,
      cursorHeight: cursorHeight,
      cursorRadius: cursorRadius,
      onChanged: onChanged,
      onEditingComplete: onEditingComplete,
      onFieldSubmitted: onFieldSubmitted,
      autofillHints: autofillHints,
      onSaved: (value) {
        ref.read(formContextNotifierProvider.notifier).setValue(name, value);
      },
      validator: validator,
    );
  }
}
