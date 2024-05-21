/* eslint-disable react/jsx-props-no-spreading */
import type { FootprintUserData } from '@onefootprint/footprint-js';
import cx from 'classnames';
import get from 'lodash/get';
import React, { useContext } from 'react';

import { useFootprint } from '../../../hooks/use-footprint';
import fieldContext from '../field-context';
import AddressCityInput from './components/address-city-input';
import AddressCountryInput from './components/address-country-input';
import AddressLine1Input from './components/address-line-1-input';
import AddressLine2Input from './components/address-line-2-input';
import AddressStateInput from './components/address-state-input';
import AddressZipInput from './components/address-zip-input';
import DobInput from './components/dob-input';
import EmailInput from './components/email-input';
import FirstNameInput from './components/first-name-input';
import LastNameInput from './components/last-name-input';
import MiddleNameInput from './components/middle-name-input';
import PhoneInput from './components/phone-input';
import ssn4Input from './components/ssn-4-input';
import SSN9INput from './components/ssn-9-input';

export type InputProps =
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.SelectHTMLAttributes<HTMLSelectElement>;

const Components: Record<
  keyof Partial<FootprintUserData>,
  React.ComponentType
> = {
  'id.address_line1': AddressLine1Input,
  'id.address_line2': AddressLine2Input,
  'id.citizenships': () => null,
  'id.city': AddressCityInput,
  'id.country': AddressCountryInput,
  'id.dob': DobInput,
  'id.email': EmailInput,
  'id.first_name': FirstNameInput,
  'id.last_name': LastNameInput,
  'id.middle_name': MiddleNameInput,
  'id.nationality': () => null,
  'id.phone_number': PhoneInput,
  'id.ssn4': ssn4Input,
  'id.ssn9': SSN9INput,
  'id.state': AddressStateInput,
  'id.us_legal_status': () => null,
  'id.visa_expiration_date': () => null,
  'id.visa_kind': () => null,
  'id.zip': AddressZipInput,
};

const Input = ({ className, id, ...props }: InputProps) => {
  const {
    form: {
      formState: { errors },
    },
  } = useFootprint();
  const ctx = useContext(fieldContext);
  if (!ctx.name) {
    throw new Error('Input must be used inside a Field component');
  }

  const error = get(errors, ctx.name);

  const Component = Components[ctx.name];
  if (Component) {
    return (
      <Component
        aria-invalid={!!error}
        /** @ts-ignore */
        className={cx('fp-input', className)}
        id={id || ctx.id}
        {...props}
      />
    );
  }

  return null;
};

export default Input;
