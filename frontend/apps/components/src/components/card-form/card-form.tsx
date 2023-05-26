/* eslint-disable react/jsx-props-no-spreading */
import { Grid } from '@onefootprint/ui';
import creditcardutils from 'creditcardutils';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import CardCvc from './components/card-cvc';
import CardExpDateInput from './components/card-exp-date-input';
import CardNumberInput from './components/card-number-input';

export type CardFormData = {
  number: string;
  expiry: string;
  cvc: string;
};

const DEFAULT_CVC_NUM_DIGITS = 3;
const AMEX_CVC_NUM_DIGITS = 4;

const CardForm = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CardFormData>();

  const cardNumber = watch('number');
  const getNumDigits = () => {
    const cardType = creditcardutils.parseCardType(cardNumber);
    if (cardType === 'amex') {
      return AMEX_CVC_NUM_DIGITS;
    }
    return DEFAULT_CVC_NUM_DIGITS;
  };

  return (
    <Container>
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
      <Grid.Row>
        <Grid.Column col={8}>
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
        <Grid.Column col={4}>
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
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default CardForm;
