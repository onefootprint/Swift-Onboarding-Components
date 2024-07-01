import get from 'lodash/get';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { isEmail, isMobilePhone } from 'validator';

import fieldContext from '../field-context';

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
};

const getProps = (name: string) => {
  if (name === 'id.phone_number') {
    return person.phoneNumber;
  }
  if (name === 'id.email') {
    return person.email;
  }
  return null;
};

export default useFieldProps;
