/* eslint-disable react/jsx-props-no-spreading */
import { useTranslation } from '@onefootprint/hooks';
import { Grid } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import CardCvc, { CvcLength } from './components/card-cvc';
import CardExpDateInput from './components/card-exp-date-input';
import CardNumberInput from './components/card-number-input';

export type CardData = {
  number: string;
  expiry: string;
  cvc: string;
};

const DEFAULT_CVC_NUM_DIGITS = CvcLength.three;
const AMEX_CVC_NUM_DIGITS = CvcLength.four;

const Card = () => {
  const { t } = useTranslation('pages.secure-form.card.form');
  const { register, watch, formState } = useFormContext<CardData>();
  const { errors } = formState;

  const cardNumber = watch('number');
  let numDigits = DEFAULT_CVC_NUM_DIGITS;
  const cardType = creditcardutils.parseCardType(cardNumber);
  if (cardType === 'amex') {
    numDigits = AMEX_CVC_NUM_DIGITS;
  }

  return (
    <Grid.Container
      templateAreas={['number number', 'date cvc']}
      columnGap={5}
      rowGap={5}
    >
      <Grid.Item gridArea="number">
        <CardNumberInput
          data-private
          hasError={!!errors.number}
          hint={errors.number?.message}
          {...register('number', {
            required: {
              value: true,
              message: t('number.error'),
            },
          })}
        />
      </Grid.Item>
      <Grid.Item gridArea="date">
        <CardExpDateInput
          data-private
          hasError={!!errors.expiry}
          hint={errors.expiry?.message}
          {...register('expiry', {
            required: {
              value: true,
              message: t('expiry.error'),
            },
          })}
        />
      </Grid.Item>
      <Grid.Item gridArea="cvc">
        <CardCvc
          data-private
          hasError={!!errors.cvc}
          hint={errors.cvc?.message}
          numDigits={numDigits}
          {...register('cvc', {
            required: {
              value: true,
              message: t('cvc.error'),
            },
          })}
        />
      </Grid.Item>
    </Grid.Container>
  );
};

export default Card;
