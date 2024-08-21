import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:footprint_flutter/src/config/corporation_types.dart';
import 'package:footprint_flutter/src/config/countries.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/providers/fp_context_notifier.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/validators.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

typedef InputProps = ({
  FormFieldValidator<String>? validator,
  TextInputType? keyboardType,
  TextInputAction? textInputAction,
  List<TextInputFormatter>? inputFormatters,
  int? maxLength,
  List<String>? autofillHints,
});

typedef FieldProps = ({String name, InputProps? inputProps});

FieldProps getFieldProps(WidgetRef ref, String name) {
  final fpContext = ref.watch(fpContextNotifierProvider);

  final locale = fpContext.locale;

  if (name.isEmpty) {
    throw Exception('Input must be used inside a Field component');
  }

  final props = getProps(name, locale);
  if (props == null) {
    throw Exception('Field $name is not supported');
  }

  return (
    name: name,
    inputProps: props,
  );
}

Map<String, InputProps> getPersonProps(FootprintSupportedLocale? locale) {
  final phoneMaskFormatter = MaskTextInputFormatter(
      mask: '+####################',
      filter: {"#": RegExp(r'[0-9]')},
      type: MaskAutoCompletionType.lazy);
  InputProps phoneNumberInputProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: [phoneMaskFormatter],
    textInputAction: TextInputAction.done,
    maxLength: null,
    autofillHints: const [AutofillHints.telephoneNumber],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Phone is required';
      }
      if (!isPhoneNumber(value)) {
        return 'Invalid phone number';
      }
      return null;
    }
  );

  InputProps emailInputProps = (
    keyboardType: TextInputType.emailAddress,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    autofillHints: const [AutofillHints.email],
    maxLength: null,
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Email is required';
      }
      if (!isEmail(value)) {
        return 'Invalid email';
      }
      return null;
    }
  );

  final dobMaskFormatter = MaskTextInputFormatter(
    mask: '##/##/####',
    filter: {'#': RegExp(r'[0-9]')},
    type: MaskAutoCompletionType.lazy,
  );
  InputProps dobInputProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: [dobMaskFormatter],
    textInputAction: TextInputAction.done,
    maxLength: null,
    autofillHints: const [AutofillHints.birthday],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Date of birth is required';
      }
      return validateDob(value, locale: locale);
    }
  );

  InputProps ssn4InputProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: [
      FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
    ],
    textInputAction: TextInputAction.done,
    maxLength: 4,
    autofillHints: null,
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'SSN is required';
      }
      if (!isSsn4(value)) {
        return 'Invalid SSN';
      }
      return null;
    }
  );

  final ssn9MaskFormatter = MaskTextInputFormatter(
    mask: '###-##-####',
    filter: {'#': RegExp(r'[0-9]')},
    type: MaskAutoCompletionType.lazy,
  );
  InputProps ssn9InputProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: [
      ssn9MaskFormatter,
    ],
    textInputAction: TextInputAction.done,
    maxLength: 11,
    autofillHints: null,
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'SSN is required';
      }
      if (!isSsn9(value)) {
        return 'Invalid SSN';
      }
      return null;
    }
  );

  InputProps firstNameInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.givenName],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'First name is required';
      }
      if (!isName(value)) {
        return 'Invalid first name';
      }
      return null;
    }
  );

  InputProps lastNameInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.familyName],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Last name is required';
      }
      if (!isName(value)) {
        return 'Invalid last name';
      }
      return null;
    }
  );

  InputProps middleNameInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.middleName],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return null;
      }
      if (!isName(value)) {
        return 'Invalid middle name';
      }
      return null;
    }
  );

  return {
    'phoneNumber': phoneNumberInputProps,
    'email': emailInputProps,
    'dob': dobInputProps,
    "ssn4": ssn4InputProps,
    "ssn9": ssn9InputProps,
    "firstName": firstNameInputProps,
    "lastName": lastNameInputProps,
    "middleName": middleNameInputProps,
  };
}

Map<String, InputProps> getCommonProps() {
  InputProps countryInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.countryName],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Country is required';
      }
      if (!COUNTRY_CODES.contains(value)) {
        return 'Please use 2-letter country code e.g. "US", "MX", "CA"';
      }
      return null;
    }
  );

  InputProps cityInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.addressCity],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'City is required';
      }
      return null;
    }
  );

  InputProps addressLine1InputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.streetAddressLine1],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Address is required';
      }
      return null;
    }
  );

  InputProps addressLine2InputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.streetAddressLine2],
    validator: (value) {
      return null;
    }
  );

  InputProps zipInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.postalCode],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Zip is required';
      }
      return null;
    }
  );

  InputProps stateInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.addressState],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'State is required';
      }
      return null;
    }
  );

  InputProps customInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: null,
    validator: null
  );

  return {
    'country': countryInputProps,
    'city': cityInputProps,
    'addressLine1': addressLine1InputProps,
    'addressLine2': addressLine2InputProps,
    'zip': zipInputProps,
    'state': stateInputProps,
    "custom": customInputProps,
  };
}

Map<String, InputProps> getBusinessProps() {
  InputProps businessNameProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.organizationName],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Business name is required';
      }
      return null;
    }
  );

  InputProps dbaInputProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: null,
    validator: null
  );

  final businessTinyMaskFormatter = MaskTextInputFormatter(
    mask: '##-#######',
    filter: {'#': RegExp(r'[0-9]')},
    type: MaskAutoCompletionType.lazy,
  );
  InputProps businessTinProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: [
      businessTinyMaskFormatter,
    ],
    textInputAction: TextInputAction.done,
    maxLength: 10,
    autofillHints: null,
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'TIN is required';
      }
      return null;
    }
  );

  InputProps businessWebsiteProps = (
    keyboardType: TextInputType.url,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: const [AutofillHints.url],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Website is required';
      }
      if (!isURL(value)) {
        return 'Invalid URL';
      }
      return null;
    }
  );

  final businessPhoneMaskFormatter = MaskTextInputFormatter(
    mask: '+####################',
    filter: {"#": RegExp(r'[0-9]')},
    type: MaskAutoCompletionType.lazy,
  );
  InputProps businessPhoneNumberProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: [businessPhoneMaskFormatter],
    textInputAction: TextInputAction.done,
    maxLength: null,
    autofillHints: const [AutofillHints.telephoneNumber],
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Phone is required';
      }
      if (!isPhoneNumber(value)) {
        return 'Invalid phone number';
      }
      return null;
    }
  );

  InputProps businessCorporationTypeProps = (
    keyboardType: TextInputType.text,
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: null,
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Corporation type is required';
      }
      if (!CORPORATION_TYPES.contains(value)) {
        return 'Invalid corporation type';
      }
      return null;
    }
  );

  return {
    'businessName': businessNameProps,
    'dba': dbaInputProps,
    'businessTin': businessTinProps,
    'businessWebsite': businessWebsiteProps,
    'businessPhoneNumber': businessPhoneNumberProps,
    'businessCorporationType': businessCorporationTypeProps,
  };
}

Map<String, InputProps> getBoProps() {
  InputProps ownershipStakeProps = (
    keyboardType: const TextInputType.numberWithOptions(signed: true),
    inputFormatters: null,
    textInputAction: TextInputAction.done,
    maxLength: 50,
    autofillHints: null,
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Ownership stake is required';
      }
      if (int.tryParse(value) == null) {
        return 'Ownership stake must be a number';
      }
      if (int.parse(value) < 25 || int.parse(value) > 100) {
        return 'Ownership stake must be between 25 and 100';
      }
      return null;
    }
  );

  return {
    'ownershipStake': ownershipStakeProps,
  };
}

InputProps? getProps(String name, FootprintSupportedLocale? locale) {
  final personProps = getPersonProps(locale);
  final commonProps = getCommonProps();
  final businessProps = getBusinessProps();
  final boProps = getBoProps();

  switch (name) {
    case "id.email":
      return personProps['email'];
    case "id.phone_number":
      return personProps['phoneNumber'];
    case "id.dob":
      return personProps['dob'];
    case "id.ssn4":
      return personProps['ssn4'];
    case "id.ssn9":
      return personProps['ssn9'];
    case "id.first_name":
      return personProps['firstName'];
    case "id.last_name":
      return personProps['lastName'];
    case "id.middle_name":
      return personProps['middleName'];
    case "id.country" || "business.country":
      return commonProps['country'];
    case "id.city" || "business.city":
      return commonProps['city'];
    case "id.address_line1" || "business.address_line1":
      return commonProps['addressLine1'];
    case "id.address_line2" || "business.address_line2":
      return commonProps['addressLine2'];
    case "id.zip" || "business.zip":
      return commonProps['zip'];
    case "id.state" || "business.state":
      return commonProps['state'];
    case "business.name":
      return businessProps['businessName'];
    case "business.dba":
      return businessProps['dba'];
    case "business.tin":
      return businessProps['businessTin'];
    case "business.website":
      return businessProps['businessWebsite'];
    case "business.phone_number":
      return businessProps['businessPhoneNumber'];
    case "business.corporation_type":
      return businessProps['businessCorporationType'];

    default:
      if (name.startsWith('custom.')) {
        return commonProps['custom'];
      }
      if (name.startsWith("business.beneficial_owners") ||
          name.startsWith("business.kyced_beneficial_owners")) {
        if (name.endsWith("first_name")) {
          return personProps['firstName'];
        }
        if (name.endsWith("last_name")) {
          return personProps['lastName'];
        }
        if (name.endsWith("middle_name")) {
          return personProps['middleName'];
        }
        if (name.endsWith("email")) {
          return personProps['email'];
        }
        if (name.endsWith("phone_number")) {
          return personProps['phoneNumber'];
        }
        if (name.endsWith("ownership_stake")) {
          return boProps['ownershipStake'];
        }
      }
      return null;
  }
}
