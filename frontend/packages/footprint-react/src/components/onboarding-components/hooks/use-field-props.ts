import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
  isEmail,
  isName,
  isPhoneNumber,
  isSsn4,
  isSsn9,
} from '@onefootprint/core';
import type { CleaveOptions } from 'cleave.js/options';
import get from 'lodash/get';
import type React from 'react';
import { useContext } from 'react';

import fieldContext from '../field-context';
import useFootprint from './use-footprint';

type Field = React.InputHTMLAttributes<HTMLInputElement> & {
  mask?: CleaveOptions;
  validations?: {
    required?: boolean | string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    validate?: (value: string) => string | boolean;
  };
};

const useFieldProps = () => {
  const {
    form: {
      formState: { errors },
    },
  } = useFootprint();
  const ctx = useContext(fieldContext);
  if (!ctx.name) {
    throw new Error('Input must be used inside a Field component');
  }
  const props = getProps(ctx.name);
  if (!props) {
    throw new Error(`Field ${ctx.name} is not supported`);
  }
  const formErrors = get(errors, ctx.name);

  return {
    'aria-invalid': !!formErrors,
    id: ctx.id,
    ...props,
    name: ctx.name,
  };
};

const person: Record<string, Field> = {
  phoneNumber: {
    autoComplete: 'tel',
    className: 'fp-phone-input',
    placeholder: 'Phone',
    type: 'tel',
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isPhoneNumber(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
  email: {
    autoComplete: 'email',
    className: 'fp-email-input',
    placeholder: 'Email',
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isEmail(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
  dob: {
    className: 'fp-dob-input',
    placeholder: 'Date of Birth',
    inputMode: 'numeric',
    mask: {
      date: true,
      datePattern: ['m', 'd', 'Y'],
      delimiter: '/',
      numericOnly: true,
    },
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (isDobInTheFuture(value)) {
          return 'errors.future-date';
        }
        if (isDobTooYoung(value)) {
          return 'errors.too-young';
        }
        if (isDobTooOld(value)) {
          return 'errors.too-old';
        }
        return true;
      },
    },
  },
  ssn4: {
    autoComplete: 'ssn',
    className: 'fp-ssn-4-input',
    placeholder: 'Last 4 of SSN',
    maxLength: 4,
    mask: {
      numericOnly: true,
      blocks: [4],
    },
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isSsn4(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
  ssn9: {
    autoComplete: 'ssn',
    className: 'fp-ssn-9-input',
    maxLength: 11,
    placeholder: 'SSN',
    mask: {
      numericOnly: true,
      delimiters: ['-', '-'],
      blocks: [3, 2, 4],
    },
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isSsn9(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
  firstName: {
    autoComplete: 'given-name',
    className: 'fp-first-name-input',
    placeholder: 'First Name',
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isName(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
  middleName: {
    autoComplete: 'additional-name',
    className: 'fp-middle-name-input',
    placeholder: 'Middle Name (optional)',
    validations: {
      validate: (value: string) => {
        if (value === '') {
          return true;
        }
        if (!isName(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
  lastName: {
    autoComplete: 'family-name',
    className: 'fp-last-name-input',
    placeholder: 'Last Name',
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isName(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
};

const common: Record<string, Field> = {
  country: {
    autoComplete: 'country-name',
    className: 'fp-countrt-input',
    placeholder: 'Country',
    validations: {
      required: 'errors.required',
    },
  },
  city: {
    autoComplete: 'address-level2',
    className: 'fp-city-input',
    placeholder: 'City',
    validations: {
      required: 'errors.required',
    },
  },
  addressLine1: {
    autoComplete: 'address-line1',
    className: 'fp-address-line1-input',
    placeholder: 'Address line 1',
    validations: {
      required: 'errors.required',
    },
  },
  addressLine2: {
    autoComplete: 'address-line2',
    className: 'fp-address-line2-input',
    placeholder: 'Address line 2 (optional)',
    validations: {},
  },
  state: {
    className: 'fp-state-input',
    placeholder: 'State',
    validations: {
      required: 'errors.required',
    },
  },
  zip: {
    autoComplete: 'postal-code',
    className: 'fp-zip-input',
    placeholder: 'Zip',
    validations: {
      required: 'errors.required',
    },
  },
  custom: {
    className: 'fp-custom-input',
  },
};

const business: Record<string, Field> = {
  name: {
    placeholder: 'Acme Bank Inc.',
    className: 'fp-business-name-input',
    validations: {
      required: 'Business name cannot be empty or is invalid',
    },
  },
  dba: {
    placeholder: 'Acme Bank',
  },
  tin: {
    placeholder: '12-3456789',
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
    placeholder: 'https://www.acme.com',
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
    placeholder: 'Phone',
    type: 'tel',
    validations: {
      required: 'errors.required',
      validate: (value: string) => {
        if (!isPhoneNumber(value)) {
          return 'errors.invalid';
        }
        return true;
      },
    },
  },
};

const getProps = (name: string) => {
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
  return null;
};

export default useFieldProps;
