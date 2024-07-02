import get from 'lodash/get';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { isEmail, isMobilePhone } from 'validator';

import fieldContext from '../field-context';
import {
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
  isValidDate,
} from '../utils/dob-validator';
import isName from '../utils/name-validator';
import { isSSN4, isSSN9 } from '../utils/ssn-validator';

type Field = TextInputProps & {
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
    formState: { errors },
  } = useFormContext();
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
    keyboardType: 'phone-pad',
    validations: {
      required: 'Phone is required',
      validate: (value: string) => {
        if (!isMobilePhone(value)) {
          return 'Phone is invalid';
        }
        return true;
      },
    },
  },
  email: {
    autoComplete: 'email',
    autoCorrect: false,
    autoCapitalize: 'none',
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
    autoComplete: 'birthdate-full',
    validations: {
      required: 'Dob is required',
      validate: (value: string) => {
        if (!isValidDate(value)) {
          return 'Invalid date';
        }
        if (isDobInTheFuture(value)) {
          return 'Cannot be in the future';
        }
        if (isDobTooYoung(value)) {
          return 'Must be at least 18 years old';
        }
        if (isDobTooOld(value)) {
          return 'Cannot be before than 1900';
        }
        return true;
      },
    },
  },
  ssn4: {
    autoComplete: 'off',
    maxLength: 4,
    validations: {
      required: 'SSN is required',
      validate: (value: string) => {
        if (!isSSN4(value)) {
          return 'SSN is invalid';
        }
        return true;
      },
    },
  },
  ssn9: {
    autoComplete: 'off',
    maxLength: 11,
    validations: {
      required: 'SSN is required',
      validate: (value: string) => {
        if (!isSSN9(value)) {
          return 'SSN is invalid';
        }
        return true;
      },
    },
  },
  firstName: {
    autoComplete: 'given-name',
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
};

const common: Record<string, Field> = {
  country: {
    autoComplete: 'country',
    validations: {
      required: 'Country is required',
    },
  },
  city: {
    autoComplete: 'postal-address-locality',
    validations: {
      required: 'City is required',
    },
  },
  addressLine1: {
    autoComplete: 'address-line1',
    validations: {
      required: 'Address is required',
    },
  },
  addressLine2: {
    autoComplete: 'address-line2',
    validations: {},
  },
  state: {
    autoComplete: 'postal-address-region',
    validations: {
      required: 'State is required',
    },
  },
  zip: {
    autoComplete: 'postal-code',
    validations: {
      required: 'Zip is required',
    },
  },
  custom: {},
};

const business: Record<string, Field> = {
  name: {
    validations: {
      required: 'Business name cannot be empty or is invalid',
    },
  },
  dba: {},
  tin: {
    validations: {
      required: 'TIN cannot be empty or is invalid',
      pattern: {
        value: /^\d{2}-\d{7}$/,
        message: 'TIN must be in the format XX-XXXXXXX',
      },
    },
  },
  website: {
    inputMode: 'url',
    autoComplete: 'url',
    autoCapitalize: 'none',
    autoCorrect: false,
    validations: {
      required: 'Website cannot be empty',
    },
  },
  phoneNumber: {
    autoComplete: 'tel',
    keyboardType: 'phone-pad',
    validations: {
      required: 'Phone is required',
      validate: (value: string) => {
        if (!isMobilePhone(value)) {
          return 'Phone is invalid';
        }
        return true;
      },
    },
  },
};

const bo: Record<string, Field> = {
  ownershipStake: {
    keyboardType: 'number-pad',
    inputMode: 'numeric',
    validations: {
      required: 'Stake is required',
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
    if (name.endsWith('email')) {
      return person.email;
    }
    if (name.endsWith('ownership_stake')) {
      return bo.ownershipStake;
    }
  }
  return null;
};

export default useFieldProps;
