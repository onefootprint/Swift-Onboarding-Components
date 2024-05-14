import cx from 'classnames';
import React from 'react';

import { useFootprint } from '../../../hooks/use-footprint';
import AddressCityInput from '../address-city-input';
import AddressCountryInput from '../address-country-input';
import AddressLine1Input from '../address-line-1-input';
import AddressLine2Input from '../address-line-2-input';
import AddressStateInput from '../address-state-input';
import AddressZipInput from '../address-zip-input';

export type AddressInputProps = {
  className?: string;
};

const AddressInput = ({ className }: AddressInputProps) => {
  const { form } = useFootprint();

  const handleCountryChange = () => {
    form.resetField('addressLine1');
    form.resetField('addressLine2');
    form.resetField('city');
    form.resetField('state');
    form.resetField('zip');
    form.setFocus('addressLine1');
  };

  return (
    <div className={cx('fp-address-container', className)}>
      <AddressCountryInput onChange={handleCountryChange} />
      <AddressLine1Input />
      <AddressLine2Input />
      <AddressCityInput />
      <AddressZipInput />
      <AddressStateInput />
    </div>
  );
};

export default AddressInput;
