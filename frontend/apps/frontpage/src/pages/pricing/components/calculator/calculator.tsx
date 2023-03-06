import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Banner from '../banner/banner';
import Row from './components/row/row';
import TotalRow from './components/total-row';
import * as constants from './constants';

type CalculateCostProps = {
  kyc: number;
  kyb: number;
  pii: number;
  dataVaulting: number;
  vaultProxy: number;
  driversLicense: number;
};

const calculateCost = ({
  kyc,
  kyb,
  pii,
  dataVaulting,
  vaultProxy,
  driversLicense,
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
      driversLicense * constants.DRIVERS_COST,
  );

const Calculator = () => {
  const { t } = useTranslation('pages.pricing.calculator');

  const [kycValue, setKycValue] = useState(constants.KYC_INITIAL_VALUE);
  const [kybValue, setKybValue] = useState(constants.KYB_INITIAL_VALUE);
  const [piiValue, setPiiValue] = useState(constants.PII_INITIAL_VALUE);
  const [vaultProxyValue, setVaultProxyValue] = useState(
    constants.VAULT_PROXY_INITIAL_VALUE,
  );
  const [driversLicenseValue, setDriversLicenseValue] = useState(
    constants.DRIVERS_INITIAL_VALUE,
  );
  const [dataVaultingValue, setDataVaultingValue] = useState(
    constants.DATA_VAULTING_INITIAL_VALUE,
  );

  return (
    <Container>
      <Header>
        <Typography as="h2" variant="heading-3">
          {t('title')}
        </Typography>
      </Header>
      <TableRows>
        <Row
          units={`(${t('units.verifications')} / ${t('units.month')})`}
          initialValue={constants.KYC_INITIAL_VALUE}
          delta={constants.KYC_DELTA}
          minimumValue={constants.KYC_MINIMUM_VALUE}
          value={kycValue}
          onChange={setKycValue}
          initialChecked
          disabled
        >
          {t('rows.kyc')}
        </Row>
        <Row
          units={`(${t('units.persons')} / ${t('units.month')})`}
          initialValue={constants.PII_INITIAL_VALUE}
          delta={constants.PII_DELTA}
          minimumValue={constants.PII_MINIMUM_VALUE}
          value={piiValue}
          onChange={setPiiValue}
          initialChecked
          disabled
        >
          {t('rows.pii-storage')}
        </Row>
        <Row
          units={`(${t('units.verifications')} / ${t('units.month')})`}
          initialValue={constants.KYB_INITIAL_VALUE}
          delta={constants.KYB_DELTA}
          minimumValue={constants.KYB_MINIMUM_VALUE}
          value={kybValue}
          onChange={setKybValue}
        >
          {t('rows.kyb')}
        </Row>
        <Row
          units={`(${t('units.persons')} / ${t('units.month')})`}
          initialValue={constants.DATA_VAULTING_INITIAL_VALUE}
          delta={constants.DATA_VAULTING_DELTA}
          minimumValue={constants.DATA_VAULTING_MINIMUM_VALUE}
          value={dataVaultingValue}
          onChange={setDataVaultingValue}
        >
          {t('rows.custom-data-vaulting')}
        </Row>
        <Row
          units={`(${t('units.persons')} / ${t('units.month')})`}
          initialValue={constants.VAULT_PROXY_INITIAL_VALUE}
          delta={constants.VAULT_PROXY_DELTA}
          minimumValue={constants.VAULT_PROXY_MINIMUM_VALUE}
          value={vaultProxyValue}
          onChange={setVaultProxyValue}
        >
          {t('rows.vault-proxy')}
        </Row>
        <Row
          units={`(${t('units.scans')} / ${t('units.month')})`}
          initialValue={constants.DRIVERS_INITIAL_VALUE}
          delta={constants.DRIVERS_DELTA}
          minimumValue={constants.DRIVERS_MINIMUM_VALUE}
          value={driversLicenseValue}
          onChange={setDriversLicenseValue}
        >
          {t('rows.drivers-license-scan')}
        </Row>
      </TableRows>
      <AnimatePresence>
        {kycValue < constants.KYC_THRESHOLD && (
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
                kyc: kycValue,
                kyb: kybValue,
                pii: piiValue,
                dataVaulting: dataVaultingValue,
                vaultProxy: vaultProxyValue,
                driversLicense: driversLicenseValue,
              })}
            </TotalRow>
          </motion.span>
        )}
        <AnimatePresence>
          {kycValue >= constants.KYC_THRESHOLD && (
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
