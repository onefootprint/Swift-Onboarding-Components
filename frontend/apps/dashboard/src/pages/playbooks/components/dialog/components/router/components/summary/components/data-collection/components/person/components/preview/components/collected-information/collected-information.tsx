import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

import type { Option } from './collected-information.types';
import DisplayValue from './components/display-value';

type CollectedInformationProps = {
  title: string;
  subtitle?: string;
  options?: Option;
};
const CollectedInformation = ({
  title,
  subtitle,
  options,
}: CollectedInformationProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.summary.form.person');

  return (
    <Container>
      <Typography variant="label-3" color="secondary">
        {title}
      </Typography>
      {options && (
        <OptionsContainer>
          {Object.entries(options).map(([name, value]) => (
            <OptionItem key={name}>
              <Label variant="body-3" color="tertiary">
                {t(`preview.${kebabCase(name)}`)}
              </Label>
              <DisplayValue name={name as any} value={value} />
            </OptionItem>
          ))}
        </OptionsContainer>
      )}
      {subtitle ? (
        <Typography color="tertiary" variant="body-3">
          {subtitle}
        </Typography>
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

const Label = styled(Typography)`
  white-space: nowrap;
  text-align: right;
`;

export default CollectedInformation;
