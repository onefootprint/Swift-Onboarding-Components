import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import IdDocDisplay from '../../../id-doc-display';

type CountrySpecificDocDisplayProps = {
  countryDocMappings: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
};

const CountrySpecificDocDisplay = ({ countryDocMappings }: CountrySpecificDocDisplayProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.collected-data',
  });

  return (
    <Container>
      <Text variant="label-4" color="secondary">
        {t('country-specific-docs')}
      </Text>
      <CountryDoclist>
        {Object.entries(countryDocMappings).map(([country, docs]) => {
          const countryName = getCountryNameFromCode(country as CountryCode);
          return (
            <Row key={countryName} role="row">
              <Label variant="body-3" color="tertiary">
                {countryName}
              </Label>
              <IdDocDisplay idDocKind={docs as SupportedIdDocTypes[]} threshold={2} />
            </Row>
          );
        })}
      </CountryDoclist>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    margin-top: ${theme.spacing[4]};
    justify-content: start;
    width: 100%;
  `}
`;
const CountryDoclist = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-left: ${theme.spacing[3]};
  `}
`;

const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[10]};
    height: ${theme.spacing[7]};
    justify-content: space-between;
    width: 100%;
  `}
`;

const Label = styled(Text)`
  white-space: nowrap;
  text-align: right;
`;

export default CountrySpecificDocDisplay;
