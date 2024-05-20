import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

type CardRowProps = {
  title: string;
  value?: string | boolean;
};

const CardRow = ({ title, value }: CardRowProps) => {
  const renderValue = () => {
    if (typeof value === 'string') {
      return <Text variant="body-3">{value}</Text>;
    }
    return value ? <IcoCheck24 /> : <IcoCloseSmall24 />;
  };

  return (
    <Stack direction="row" align="center">
      <Text
        variant="body-3"
        display="inline-flex"
        width="100%"
        color="tertiary"
      >
        {title}
      </Text>
      {renderValue()}
    </Stack>
  );
};

export default CardRow;
