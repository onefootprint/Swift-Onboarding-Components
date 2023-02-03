import { useTranslation } from '@onefootprint/hooks';
import { IcoMinusSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import { media, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Sparkles from '../../../components/sparkles/sparkles';

const MoneyAnimation = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

const SectionsAnimation = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const calculateCost = (users: number) =>
  users * (CREDIT_DOLLAR_VALUE * STORAGE_ANNUAL_CREDITS) +
  users * (CREDIT_DOLLAR_VALUE * KYC_CREDITS);

const CREDIT_DOLLAR_VALUE = 0.25;
const STORAGE_ANNUAL_CREDITS = 1;
const KYC_CREDITS = 2;

const INITIAL_USER_VALUE = 5000;
const SPECIAL_PRICE_USERS_THRESHOLD = 120000;
const INCREMENT_USERS_BY = 5000;
const MINIMUM_USER_VALUE = 5000;

const Calculator = () => {
  const { t } = useTranslation('pages.pricing.core-plan.calculator');
  const [users, setUsers] = useState(INITIAL_USER_VALUE);
  const cost = calculateCost(users);

  const increaseUsers = () => {
    setUsers(currentUsers => currentUsers + INCREMENT_USERS_BY);
  };

  const decreaseUsers = () => {
    if (users > MINIMUM_USER_VALUE) {
      setUsers(currentUsers => currentUsers - INCREMENT_USERS_BY);
    }
  };

  return (
    <Container>
      <Line>
        <Typography variant="label-3">{t('onboarding')}</Typography>
        <Controllers>
          <Button
            onClick={decreaseUsers}
            disabled={users === MINIMUM_USER_VALUE}
          >
            <IcoMinusSmall16 />
          </Button>
          <Input>
            <Typography variant="label-3">
              {users.toLocaleString('en-US')}
            </Typography>
          </Input>
          <Button data-type="up" onClick={increaseUsers}>
            <IcoPlusSmall16 />
          </Button>
        </Controllers>
        <Typography variant="label-3">{t('users-year')}</Typography>
        {users < SPECIAL_PRICE_USERS_THRESHOLD ? (
          <motion.span
            animate="animate"
            variants={SectionsAnimation}
            initial="initial"
          >
            <Typography variant="label-3">
              {t('will-have-a-cost-of')}{' '}
              <motion.span
                key={cost}
                animate="animate"
                variants={MoneyAnimation}
                initial="initial"
              >
                ${cost.toLocaleString('en-US')}
              </motion.span>
              {t('per-year')}
            </Typography>
          </motion.span>
        ) : (
          <>
            <Typography variant="label-3">{t('unblocks')}</Typography>
            <motion.span
              animate="animate"
              variants={SectionsAnimation}
              initial="initial"
            >
              <Sparkles color="#fddf63">
                <Banner data-type="success">
                  <Typography variant="label-3" color="success">
                    {t('banner-custom')}
                  </Typography>
                </Banner>
              </Sparkles>
            </motion.span>
          </>
        )}
      </Line>
      {users < SPECIAL_PRICE_USERS_THRESHOLD && (
        <motion.span
          animate="animate"
          variants={SectionsAnimation}
          initial="initial"
        >
          <Sparkles color="#fddf63">
            <Banner data-type="info">
              <Typography variant="label-3" color="info">
                {t('banner-recoup')}
              </Typography>
            </Banner>
          </Sparkles>
        </motion.span>
      )}
    </Container>
  );
};

const Controllers = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.primary};
    overflow: hidden;
  `};
`;

const Button = styled.button`
  ${({ theme }) => css`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[2]};

    &[data-type='up'] {
      transform: rotate(180deg);
    }

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &:active {
      background-color: ${theme.backgroundColor.senary};
    }

    &:disabled {
      cursor: not-allowed;
      background-color: ${theme.backgroundColor.secondary};
      opacity: 0.5;
    }
  `}
`;

const Input = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[2]};
    padding: 0 ${theme.spacing[2]};
    color: ${theme.color.primary};
    text-align: center;
    appearance: textfield;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[6]} 0 ${theme.spacing[4]} 0;
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    ${media.greaterThan('sm')`
      display: flex;
    `}
  `}
`;

const Line = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

const Banner = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};

    &[data-type='info'] {
      background-color: ${theme.backgroundColor.info};
    }

    &[data-type='success'] {
      background-color: ${theme.backgroundColor.success};
    }
  `};
`;

export default Calculator;
