import { Stack, Text } from '@onefootprint/ui';
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
    <Stack flexDirection="column" gap={4}>
      {title && (
        <Text variant="label-2" color="secondary">
          {title}
        </Text>
      )}
      {options ? (
        <Stack flexDirection="column" alignItems="center" gap={2}>
          {Object.entries(options).map(([name, value]) => {
            if (value == null || value === undefined) return null;
            const typedName = name as keyof Option;
            const typedValue = value as Option[keyof Option];
            const label = getLabel(typedName);

            return (
              // biome-ignore lint/a11y/useSemanticElements: TODO: change to <tr />
              <OptionItem key={name} role="row" aria-label={label}>
                <DisplayValue name={typedName} value={typedValue} />
                <Label name={typedName} value={typedValue} />
              </OptionItem>
            );
          })}
        </Stack>
      ) : null}
      {subtitle && (
        <Text color="secondary" variant="body-2">
          {subtitle}
        </Text>
      )}
    </Stack>
  );
};

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
