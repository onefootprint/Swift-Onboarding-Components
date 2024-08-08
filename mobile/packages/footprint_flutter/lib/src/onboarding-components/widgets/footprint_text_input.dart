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
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.textAlign = TextAlign.start,
    this.textAlignVertical,
    this.readOnly = false,
    this.enabled = true,
    this.maxLines,
    this.minLines,
    this.maxLength,
    this.maxLengthEnforcement,
    this.inputFormatters,
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
    this.validator,
    this.decoration,
  });

  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? initialValue;
  final String? labelText;
  final String? hintText;
  final bool obscureText;
  final String obscuringCharacter;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final TextAlign textAlign;
  final TextAlignVertical? textAlignVertical;
  final bool readOnly;
  final bool enabled;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final MaxLengthEnforcement? maxLengthEnforcement;
  final List<TextInputFormatter>? inputFormatters;
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
  final FormFieldValidator<String>? validator;
  final InputDecoration? decoration;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = FieldContext.of(context)!.name;

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
      onSaved: (value) {
        ref.read(formContextNotifierProvider.notifier).setValue(name, value);
      },
      validator: validator,
    );
  }
}
