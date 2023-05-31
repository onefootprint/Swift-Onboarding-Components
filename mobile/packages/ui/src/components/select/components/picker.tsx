import { COUNTRIES } from '@onefootprint/global-constants';
import { IcoClose32, IcoSearch24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Modal } from 'react-native';

import { Box } from '../../box';
import { Flag } from '../../flag';
import { IconButton } from '../../icon-button';
import { TextInput } from '../../text-input';
import { Typography } from '../../typography';

const Item = ({ item }: any) => {
  return (
    <Box margin={4} flexDirection="row" gap={4} alignItems="center">
      <Flag code={item.value} />
      <Typography variant="body-4">{item.label}</Typography>
    </Box>
  );
};

export type PickerProps = {
  emptyStateText: string;
  onClose: () => void;
  open: boolean;
  placeholder: string;
  searchPlaceholder: string;
};

const Picker = ({
  emptyStateText,
  onClose,
  open,
  placeholder,
  searchPlaceholder,
}: PickerProps) => {
  console.log(emptyStateText);
  // const [search, setSearch] = useState('');

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
      visible={open}
    >
      <Box backgroundColor="primary" borderRadius="large" height="100%">
        <Box flexDirection="row" margin={5} center position="relative">
          <Typography variant="label-2">{placeholder}</Typography>
          <Box position="absolute" right={0}>
            <IconButton aria-label="Close" onPress={onClose}>
              <IcoClose32 />
            </IconButton>
          </Box>
        </Box>
        <Box
          borderBottomColor="tertiary"
          borderBottomWidth={1}
          paddingHorizontal={4}
          paddingVertical={5}
        >
          <StyledTextInput
            placeholder={searchPlaceholder}
            prefixComponent={
              <Box marginLeft={4} marginVertical={5}>
                <IcoSearch24 />
              </Box>
            }
          />
        </Box>
        <FlashList
          contentContainerStyle={contentContainerStyle}
          data={COUNTRIES}
          estimatedItemSize={COUNTRIES.length}
          keyExtractor={item => item.value}
          renderItem={Item}
        />
      </Box>
    </Modal>
  );
};

const StyledTextInput = styled(TextInput)`
  ${({ theme }) => {
    return css`
      padding-left: ${theme.spacing[9]};
    `;
  }}
`;

const contentContainerStyle = {
  paddingHorizontal: 8,
  paddingVertical: 16,
};

export default Picker;
