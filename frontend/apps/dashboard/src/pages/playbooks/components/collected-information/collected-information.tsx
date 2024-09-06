import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import type { Option } from './collected-information.types';
import DisplayValue from './components/display-value';
import Label from './components/label';
import useInfoLabel from './hooks/use-info-label';

type CollectedInformationProps = {
  title?: string;
  subtitle?: string;
  options?: Option;
};

const CollectedInformation = ({ title, subtitle, options }: CollectedInformationProps) => {
  const getLabel = useInfoLabel();

  return (
    <Container>
      {title && <Text variant="label-4">{title}</Text>}
      {options && (
        <OptionsContainer>
          {Object.entries(options).map(([name, value]) => {
            if (value == null || value === undefined) return null;
            const typedName = name as keyof Option;
            const typedValue = value as Option[keyof Option];
            return (
              <OptionItem key={name} role="row" aria-label={getLabel(typedName)}>
                <DisplayValue name={typedName} value={typedValue} />
                <Label name={typedName} value={typedValue} />
              </OptionItem>
            );
          })}
        </OptionsContainer>
      )}
      {subtitle && (
        <Text color="tertiary" variant="body-3">
          {subtitle}
        </Text>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
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
    gap: ${theme.spacing[3]};
    height: ${theme.spacing[7]};
    justify-content: flex-start;
    width: 100%;
  `}
`;

export default CollectedInformation;
