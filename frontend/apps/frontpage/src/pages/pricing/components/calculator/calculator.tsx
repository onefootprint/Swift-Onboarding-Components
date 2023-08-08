import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import * as constants from '../../utils/constants';
import Banner from '../banner';
import Row from './components/row';
import TotalRow from './components/total-row';

type CalculateCostProps = {
  kyc: number;
  kyb: number;
  pii: number;
  dataVaulting: number;
  vaultProxy: number;
  driversLicense: number;
  embeddedOnboarding: number;
  auth: number;
};

const calculateCost = ({
  kyc,
  kyb,
  pii,
  dataVaulting,
  vaultProxy,
  driversLicense,
  embeddedOnboarding,
  auth,
}: CalculateCostProps) =>
  Intl.NumberFormat('us-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3,
  }).format(
    kyc * constants.KYC_COST +
      kyb * constants.KYB_COST +
      pii * constants.PII_COST +
      dataVaulting * constants.DATA_VAULTING_COST +
      vaultProxy * constants.VAULT_PROXY_COST +
      driversLicense * constants.DRIVERS_COST +
      embeddedOnboarding * constants.EMBEDDED_ONBOARDING_COST +
      auth * constants.AUTH_COST,
  );

const Calculator = () => {
  const { t } = useTranslation('pages.pricing.calculator');
  const [calculatorValues, setCalculatorValues] = useState({
    kyc: constants.KYC_INITIAL_VALUE,
    kyb: constants.KYB_INITIAL_VALUE,
    pii: constants.PII_INITIAL_VALUE,
    dataVaulting: constants.DATA_VAULTING_INITIAL_VALUE,
    vaultProxy: constants.VAULT_PROXY_INITIAL_VALUE,
    driversLicense: constants.DRIVERS_INITIAL_VALUE,
    embeddedOnboarding: constants.EMBEDDED_ONBOARDING_INITIAL_VALUE,
    auth: constants.AUTH_INITIAL_VALUE,
  });

  const variablesToCalculate = [
    {
      key: 'kyc',
      unit: 'verifications',
      unitSecond: 'month',
      initialValue: constants.KYC_INITIAL_VALUE,
      delta: constants.KYC_DELTA,
      minimumValue: constants.KYC_MINIMUM_VALUE,
      value: calculatorValues.kyc,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, kyc: value }));
      },
      initialChecked: true,
      disabled: true,
    },
    {
      key: 'pii-storage',
      unit: 'persons',
      unitSecond: 'month',
      initialValue: constants.PII_INITIAL_VALUE,
      delta: constants.PII_DELTA,
      minimumValue: constants.PII_MINIMUM_VALUE,
      value: calculatorValues.pii,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, pii: value }));
      },
      initialChecked: true,
      disabled: true,
    },
    {
      key: 'drivers-license-scan',
      unit: 'persons',
      unitSecond: 'month',
      initialValue: constants.DRIVERS_INITIAL_VALUE,
      delta: constants.DRIVERS_DELTA,
      minimumValue: constants.DRIVERS_MINIMUM_VALUE,
      value: calculatorValues.driversLicense,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, driversLicense: value }));
      },
    },
    {
      key: 'kyb',
      unit: 'verifications',
      unitSecond: 'month',
      initialValue: constants.KYB_INITIAL_VALUE,
      delta: constants.KYB_DELTA,
      minimumValue: constants.KYB_MINIMUM_VALUE,
      value: calculatorValues.kyb,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, kyb: value }));
      },
    },
    {
      key: 'non-identity-data-vaulting',
      unit: 'persons',
      unitSecond: 'month',
      initialValue: constants.DATA_VAULTING_INITIAL_VALUE,
      delta: constants.DATA_VAULTING_DELTA,
      minimumValue: constants.DATA_VAULTING_MINIMUM_VALUE,
      value: calculatorValues.dataVaulting,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, dataVaulting: value }));
      },
    },
    {
      key: 'vault-proxy',
      unit: 'active-user',
      unitSecond: 'month',
      initialValue: constants.VAULT_PROXY_INITIAL_VALUE,
      delta: constants.VAULT_PROXY_DELTA,
      minimumValue: constants.VAULT_PROXY_MINIMUM_VALUE,
      value: calculatorValues.vaultProxy,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, vaultProxy: value }));
      },
    },
    {
      key: 'embedded-onboarding',
      unit: 'persons',
      unitSecond: 'month',
      initialValue: constants.EMBEDDED_ONBOARDING_INITIAL_VALUE,
      delta: constants.EMBEDDED_ONBOARDING_DELTA,
      minimumValue: constants.EMBEDDED_ONBOARDING_MINIMUM_VALUE,
      value: calculatorValues.embeddedOnboarding,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, embeddedOnboarding: value }));
      },
    },
    {
      key: 'auth',
      unit: 'active-user',
      unitSecond: 'month',
      initialValue: constants.AUTH_INITIAL_VALUE,
      delta: constants.AUTH_DELTA,
      minimumValue: constants.AUTH_MINIMUM_VALUE,
      value: calculatorValues.auth,
      onChange: (value: number) => {
        setCalculatorValues(prev => ({ ...prev, auth: value }));
      },
    },
  ];

  return (
    <Container>
      <Header>
        <Typography as="h2" variant="heading-3">
          {t('title')}
        </Typography>
      </Header>
      <TableRows>
        {variablesToCalculate.map(row => (
          <Row
            key={row.key}
            units={`(${t(`units.${row.unit}`)} / ${t(
              `units.${row.unitSecond}`,
            )})`}
            initialValue={row.initialValue}
            delta={row.delta}
            minimumValue={row.minimumValue}
            value={row.value}
            onChange={row.onChange}
            initialChecked={row.initialChecked}
            disabled={row.disabled}
          >
            {t(`rows.${row.key}`)}
          </Row>
        ))}
      </TableRows>
      <AnimatePresence>
        {calculatorValues.kyc < constants.KYC_THRESHOLD && (
          <motion.span
            initial={{ opacity: 0.5, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.5, y: -20 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
            style={{ width: '100%' }}
          >
            <TotalRow>
              {calculateCost({
                kyc: calculatorValues.kyc,
                kyb: calculatorValues.kyb,
                pii: calculatorValues.pii,
                dataVaulting: calculatorValues.dataVaulting,
                vaultProxy: calculatorValues.vaultProxy,
                driversLicense: calculatorValues.driversLicense,
                embeddedOnboarding: calculatorValues.embeddedOnboarding,
                auth: calculatorValues.auth,
              })}
            </TotalRow>
          </motion.span>
        )}
        <AnimatePresence>
          {calculatorValues.kyc >= constants.KYC_THRESHOLD && (
            <motion.span
              initial={{ opacity: 0.5, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.5, y: -20 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
              style={{ width: '100%' }}
            >
              <Banner title={t('banners.custom-pricing.title')} />
            </motion.span>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.default};
    width: 100%;
    gap: ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    overflow: hidden;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[8]} 0;
  `}
`;

const TableRows = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-bottom: ${theme.spacing[4]};
  `}
`;

export default Calculator;
