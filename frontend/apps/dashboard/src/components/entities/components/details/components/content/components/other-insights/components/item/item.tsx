import { IcoInfo16 } from '@onefootprint/icons';
import { UserInsightsUnit } from '@onefootprint/types';
import { Stack, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type ItemProps = {
  name: string;
  value: string;
  description: string;
  unit: UserInsightsUnit;
};

const Item = ({
  name: rawName,
  value: rawValue,
  description,
  unit: rawUnit,
}: ItemProps) => {
  const name = capitalizeFirstLetter(rawName);
  const { unit, value } = formatValue(rawValue, rawUnit);

  return (
    <Stack direction="row" width="100%" padding={3} gap={3}>
      <Text variant="body-3" maxWidth="50%" truncate display="flex" gap={2}>
        {name}
        {description && (
          <Tooltip text={description} position="bottom">
            <IcoInfo16 />
          </Tooltip>
        )}
      </Text>
      <Line />
      <Text variant="body-3" maxWidth="50%" truncate>
        {value}
        {unit && (
          <Text variant="body-3" color="tertiary" tag="span" marginLeft={2}>
            {unit}
          </Text>
        )}
      </Text>
    </Stack>
  );
};

const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const formatValue = (value: string, unit: UserInsightsUnit) => {
  if (unit === UserInsightsUnit.TimeInMs) {
    const seconds = Math.floor(Number.parseInt(value, 10) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return {
        value: `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`,
        unit: 'min',
      };
    }
    return {
      value: `${seconds}`,
      unit: 's',
    };
  }
  return { value, unit: null };
};

const Line = styled.div`
  ${({ theme }) => css`
    flex: 1;
    position: relative;

    &::after {
      content: '';
      bottom: 7px;
      left: 0;
      position: absolute;
      right: 0;
      border-bottom: ${theme.borderWidth[1]} dashed
        ${theme.borderColor.tertiary};
    }
  `}
`;

export default Item;
