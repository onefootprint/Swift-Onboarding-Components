import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import type { ComponentProps } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { Option } from './collected-information.types';
import DisplayValue from './components/display-value';

type DisplayValueProps = ComponentProps<typeof DisplayValue>;

type CollectedInformationProps = {
  title?: string;
  subtitle?: string;
  options?: Option;
};

const CollectedInformation = ({ title, subtitle, options }: CollectedInformationProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.collected-data',
  });

  return (
    <Container>
      {title && <Text variant="label-3">{title}</Text>}
      {options && (
        <OptionsContainer>
          {Object.entries(options).map(([name, value]) => {
            if (value == null || value === undefined) return null;
            return (
              <OptionItem key={name} role="row" aria-label={t(kebabCase(name) as ParseKeys<'common'>)}>
                <Label variant="body-3" color="tertiary">
                  {t(kebabCase(name) as ParseKeys<'common'>)}
                </Label>
                <DisplayValue name={name as DisplayValueProps['name']} value={value} />
              </OptionItem>
            );
          })}
        </OptionsContainer>
      )}
      {subtitle ? (
        <Text color="tertiary" variant="body-3">
          {subtitle}
        </Text>
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const OptionItem = styled.div`
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

export default CollectedInformation;
