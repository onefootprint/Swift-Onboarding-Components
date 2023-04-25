import styled from '@onefootprint/styled';
import { Button, Typography } from '@onefootprint/ui';
import React from 'react';
import { View } from 'react-native';

const Wallet = () => (
  <View>
    <Button onPress={() => {}} disabled>
      Button
    </Button>
    <Text variant="body-4">Hello World</Text>
  </View>
);

const Text = styled(Typography)`
  font-size: 48px;
  margin-top: 24px;
  color: red;
`;

export default Wallet;
