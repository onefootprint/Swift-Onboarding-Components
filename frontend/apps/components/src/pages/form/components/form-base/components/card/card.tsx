/* eslint-disable react/jsx-props-no-spreading */
import { Grid } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CardCvc, { CvcLength } from './components/card-cvc';
import CardExpDateInput from './components/card-exp-date-input';
import CardNumberInput from './components/card-number-input';
import { isCardCvcValid, isCardExpiryValid, isCardNumberValid } from './utils/validations';

export type CardData = {
  number: string;
  expiry: string;
  cvc: string;
};

const DEFAULT_CVC_NUM_DIGITS = CvcLength.three;
const AMEX_CVC_NUM_DIGITS = CvcLength.four;

const Card = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.card.form',
  });
  const { register, watch, formState } = useFormContext<CardData>();
  const { errors } = formState;

  const cardNumber = watch('number');
  let numDigits = DEFAULT_CVC_NUM_DIGITS;
  const cardType = creditcardutils.parseCardType(cardNumber);
  if (cardType === 'amex') {
    numDigits = AMEX_CVC_NUM_DIGITS;
  }

  const getHint = (field: keyof CardData) => {
    const error = errors[field];
    const { message, type } = error ?? {};
    if (message && typeof message === 'string') {
      return message;
    }
    if (error) {
      return t(`${field}.errors.${type}` as ParseKeys<'common'>);
    }
    return undefined;
  };

  const cardNumberError = getHint('number');
  const cardExpiryError = getHint('expiry');
  const cardCvcError = getHint('cvc');

  return (
    <Grid.Container columns={['1fr 1fr']} rows={['auto']} gap={5}>
      <InputContainer row="1" column="span 2">
        <CardNumberInput
          data-private
          hasError={!!cardNumberError}
          hint={cardNumberError}
          {...register('number', {
            required: true,
            validate: {
              empty: value => !!value,
              invalid: value => isCardNumberValid(value),
            },
          })}
        />
      </InputContainer>
      <InputContainer row="2">
        <CardExpDateInput
          data-private
          hasError={!!cardExpiryError}
          hint={cardExpiryError}
          {...register('expiry', {
            required: true,
            validate: {
              empty: value => !!value,
              invalid: value => isCardExpiryValid(value),
            },
          })}
        />
      </InputContainer>
      <InputContainer row="2">
        <CardCvc
          data-private
          hasError={!!cardCvcError}
          hint={cardCvcError}
          numDigits={numDigits}
          {...register('cvc', {
            required: true,
            validate: {
              empty: value => !!value,
              invalid: value => isCardCvcValid(value, numDigits),
            },
          })}
        />
      </InputContainer>
    </Grid.Container>
  );
};

const InputContainer = styled(Grid.Item)`
  & > * {
    width: 100%;
  }
`;

export default Card;
