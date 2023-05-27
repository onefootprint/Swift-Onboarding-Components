/* eslint-disable react/jsx-props-no-spreading */
import { Grid } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import CardCvc from './components/card-cvc';
import CardExpDateInput from './components/card-exp-date-input';
import CardNumberInput from './components/card-number-input';

export type CardData = {
  number: string;
  expiry: string;
  cvc: string;
};

const DEFAULT_CVC_NUM_DIGITS = 3;
const AMEX_CVC_NUM_DIGITS = 4;

const Card = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CardData>();

  const cardNumber = watch('number');
  const getNumDigits = () => {
    const cardType = creditcardutils.parseCardType(cardNumber);
    if (cardType === 'amex') {
      return AMEX_CVC_NUM_DIGITS;
    }
    return DEFAULT_CVC_NUM_DIGITS;
  };

  return (
    <Grid.Row>
      <Grid.Column col={6}>
        <CardNumberInput
          data-private
          hasError={!!errors.number}
          hint={errors.number?.message}
          {...register('number', {
            required: {
              value: true,
              message: 'Card number cannot be empty.',
            },
          })}
        />
      </Grid.Column>
      <Grid.Column col={3}>
        <CardExpDateInput
          data-private
          hasError={!!errors.expiry}
          hint={errors.expiry?.message}
          {...register('expiry', {
            required: {
              value: true,
              message: 'Expiry date cannot be empty.',
            },
          })}
        />
      </Grid.Column>
      <Grid.Column col={3}>
        <CardCvc
          data-private
          hasError={!!errors.cvc}
          hint={errors.cvc?.message}
          numDigits={getNumDigits()}
          {...register('cvc', {
            required: {
              value: true,
              message: 'CVC cannot be empty',
            },
          })}
        />
      </Grid.Column>
    </Grid.Row>
  );
};

export default Card;
