import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
  isEmail,
  isName,
  isPhoneNumber,
  isSsn4,
  isSsn9,
  isValidDate,
} from '@onefootprint/core';
import type { CleaveOptions } from 'cleave.js/options';
import get from 'lodash/get';
import type React from 'react';
import { useContext } from 'react';

import { SupportedLocale } from '@onefootprint/types';
import { useFormContext } from 'react-hook-form';
import fieldContext from '../field-context';
import { Context } from '../provider';
import validateDob from '../utils/validate-dob';

type FormAttributes = {
  mask?: CleaveOptions;
  validations?: {
    required?: boolean | string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    validate?: (value: string) => string | boolean;
  };
  transforms?: Record<string, boolean>;
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & FormAttributes;
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & FormAttributes;
type Field = InputProps | SelectProps;
type BaseProps = { name: string; id: string; 'aria-invalid': boolean };

export type FormInputProps = InputProps & BaseProps;
export type FormSelectProps = SelectProps & BaseProps;

const useFieldProps = (): FormInputProps | FormSelectProps => {
  const [context] = useContext(Context);
  const locale = context.locale;
  const {
    formState: { errors },
  } = useFormContext();
  const ctx = useContext(fieldContext);
  if (!ctx.name) {
    throw new Error('Input must be used inside a Field component');
  }
  const props = getProps(ctx.name, { locale });
  if (!props) {
    throw new Error(`Field ${ctx.name} is not supported`);
  }
  const formErrors = get(errors, ctx.name);
  const hasError = !!formErrors;

  return {
    // @ts-ignore
    'aria-invalid': hasError,
    id: ctx.id,
    ...props,
    name: ctx.name,
  };
};

const getPersonProps = (options: { locale?: SupportedLocale }): Record<string, Field> => ({
  phoneNumber: {
    autoComplete: 'tel',
    className: 'fp-phone-input',
    type: 'tel',
    mask: {
      prefix: '+',
      noImmediatePrefix: true,
      numericOnly: true,
    },
    validations: {
      required: 'Phone is required',
      validate: (value: string) => {
        if (!isPhoneNumber(value)) {
          return 'Phone is invalid';
        }
        return true;
      },
    },
  },
  email: {
    autoComplete: 'email',
    className: 'fp-email-input',
    validations: {
      required: 'Email is required',
      validate: (value: string) => {
        if (!isEmail(value)) {
          return 'Email is invalid';
        }
        return true;
      },
    },
  },
  dob: {
    className: 'fp-dob-input',
    inputMode: 'numeric',
    mask: {
      date: true,
      datePattern: options.locale === 'en-US' ? ['m', 'd', 'Y'] : ['d', 'm', 'Y'],
      delimiter: '/',
      numericOnly: true,
    },
    validations: {
      required: 'Dob is required',
      validate: (value: string) => validateDob(value, options.locale),
    },
  },
  ssn4: {
    autoComplete: 'ssn',
    className: 'fp-ssn-4-input',
    maxLength: 4,
    mask: {
      numericOnly: true,
      blocks: [4],
    },
    validations: {
      required: 'SSN is required',
      validate: (value: string) => {
        if (!isSsn4(value)) {
          return 'SSN is invalid';
        }
        return true;
      },
    },
  },
  ssn9: {
    autoComplete: 'ssn',
    className: 'fp-ssn-9-input',
    maxLength: 11,
    mask: {
      numericOnly: true,
      delimiters: ['-', '-'],
      blocks: [3, 2, 4],
    },
    validations: {
      required: 'SSN is required',
      validate: (value: string) => {
        if (!isSsn9(value)) {
          return 'SSN is invalid';
        }
        return true;
      },
    },
  },
  firstName: {
    autoComplete: 'given-name',
    className: 'fp-first-name-input',
    validations: {
      required: 'First name is required',
      validate: (value: string) => {
        if (!isName(value)) {
          return 'First name is invalid';
        }
        return true;
      },
    },
  },
  middleName: {
    autoComplete: 'additional-name',
    className: 'fp-middle-name-input',
    validations: {
      validate: (value: string) => {
        if (value === '') {
          return true;
        }
        if (!isName(value)) {
          return 'Middle name is invalid';
        }
        return true;
      },
    },
  },
  lastName: {
    autoComplete: 'family-name',
    className: 'fp-last-name-input',
    validations: {
      required: 'Last name is required',
      validate: (value: string) => {
        if (!isName(value)) {
          return 'Last name is invalid';
        }
        return true;
      },
    },
  },
});

const getCommonProps = (): Record<string, Field> => ({
  country: {
    autoComplete: 'country-name',
    className: 'fp-countrt-input',
    validations: {
      required: 'Country is required',
    },
  },
  city: {
    autoComplete: 'address-level2',
    className: 'fp-city-input',
    validations: {
      required: 'City is required',
    },
  },
  addressLine1: {
    autoComplete: 'address-line1',
    className: 'fp-address-line1-input',
    validations: {
      required: 'Address is required',
    },
  },
  addressLine2: {
    autoComplete: 'address-line2',
    className: 'fp-address-line2-input',
    validations: {},
  },
  state: {
    className: 'fp-state-input',
    validations: {
      required: 'State is required',
    },
  },
  zip: {
    autoComplete: 'postal-code',
    className: 'fp-zip-input',
    validations: {
      required: 'Zip is required',
    },
  },
  custom: {
    className: 'fp-custom-input',
  },
});

const getBusinessProps = (): Record<string, Field> => ({
  name: {
    className: 'fp-business-name-input',
    validations: {
      required: 'Business name cannot be empty or is invalid',
    },
  },
  dba: {},
  tin: {
    className: 'fp-business-tin-input',
    mask: {
      numericOnly: true,
      delimiters: ['-'],
      blocks: [2, 7],
    },
    validations: {
      required: 'TIN cannot be empty or is invalid',
      pattern: {
        value: /^\d{2}-\d{7}$/,
        message: 'TIN must be in the format XX-XXXXXXX',
      },
    },
  },
  website: {
    type: 'url',
    className: 'fp-business-website-input',
    mask: {
      numericOnly: true,
      delimiters: ['-'],
      blocks: [2, 7],
    },
    validations: {
      required: 'Website cannot be empty',
    },
  },
  phoneNumber: {
    autoComplete: 'tel',
    className: 'fp-business-phone-input',
    type: 'tel',
    mask: {
      prefix: '+',
      noImmediatePrefix: true,
      numericOnly: true,
    },
    validations: {
      required: 'Phone is required',
      validate: (value: string) => {
        if (!isPhoneNumber(value)) {
          return 'Phone is invalid';
        }
        return true;
      },
    },
  },
  corporationType: {
    className: 'fp-business-corporation-type-input',
    validations: {
      required: 'Corporation type is required',
    },
  },
});

const getBoProps = (): Record<string, Field> => ({
  ownershipStake: {
    className: 'fp-bo-ownership-stake-input',
    type: 'number',
    validations: {
      required: 'Stake is required',
    },
    transforms: {
      valueAsNumber: true,
    },
  },
});

const getProps = (
  name: string,
  options: {
    locale?: SupportedLocale;
  },
) => {
  const person = getPersonProps(options);
  const common = getCommonProps();
  const business = getBusinessProps();
  const bo = getBoProps();

  if (name === 'id.phone_number') {
    return person.phoneNumber;
  }
  if (name === 'id.email') {
    return person.email;
  }
  if (name === 'id.dob') {
    return person.dob;
  }
  if (name === 'id.first_name') {
    return person.firstName;
  }
  if (name === 'id.middle_name') {
    return person.middleName;
  }
  if (name === 'id.last_name') {
    return person.lastName;
  }
  if (name === 'id.ssn9') {
    return person.ssn9;
  }
  if (name === 'id.ssn4') {
    return person.ssn4;
  }
  if (name === 'id.country' || name === 'business.country') {
    return common.country;
  }
  if (name === 'id.address_line1' || name === 'business.address_line1') {
    return common.addressLine1;
  }
  if (name === 'id.address_line2' || name === 'business.address_line2') {
    return common.addressLine2;
  }
  if (name === 'id.city' || name === 'business.city') {
    return common.city;
  }
  if (name === 'id.state' || name === 'business.state') {
    return common.state;
  }
  if (name === 'id.zip' || name === 'business.zip') {
    return common.zip;
  }
  if (name === 'business.name') {
    return business.name;
  }
  if (name.startsWith('custom')) {
    return common.custom;
  }
  if (name === 'business.dba') {
    return business.dba;
  }
  if (name === 'business.tin') {
    return business.tin;
  }
  if (name === 'business.website') {
    return business.website;
  }
  if (name === 'business.phone_number') {
    return business.phoneNumber;
  }
  if (name === 'business.corporation_type') {
    return business.corporationType;
  }
  if (name.startsWith('business.beneficial_owners')) {
    if (name.endsWith('first_name')) {
      return person.firstName;
    }
    if (name.endsWith('middle_name')) {
      return person.middleName;
    }
    if (name.endsWith('last_name')) {
      return person.lastName;
    }
    if (name.endsWith('phone_number')) {
      return person.phoneNumber;
    }
    if (name.endsWith('emai;')) {
      return person.email;
    }
    if (name.endsWith('ownership_stake')) {
      return bo.ownershipStake;
    }
  }
  return null;
};

export default useFieldProps;
