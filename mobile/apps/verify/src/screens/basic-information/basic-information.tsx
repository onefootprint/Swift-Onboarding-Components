import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Container,
  CountrySelect,
  TextInput,
} from '@onefootprint/ui';
import React from 'react';

import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

export type BasicInformationProps = {
  onDone: () => void;
};

const BasicInformation = ({ onDone }: BasicInformationProps) => {
  const { t } = useTranslation('pages.basic-information');

  const handleSubmit = () => {
    // TODO: Implement backend call
    onDone();
  };

  // TODO: we don't always show country of birth, so we should make this dynamic
  return (
    <Container scroll>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Box gap={7}>
        <Row>
          <Box flex={1}>
            <TextInput
              label={t('first-name-input.label')}
              placeholder={t('first-name-input.placeholder')}
              enterKeyHint="next"
            />
          </Box>
          <Box flex={1}>
            <TextInput
              label={t('middle-name-input.label')}
              placeholder={t('middle-name-input.placeholder')}
              enterKeyHint="next"
            />
          </Box>
        </Row>
        <TextInput
          label={t('last-name-input.label')}
          placeholder={t('last-name-input.placeholder')}
          enterKeyHint="next"
        />
        <TextInput
          blurOnSubmit
          enterKeyHint="send"
          label={t('dob-input.label')}
          onSubmitEditing={handleSubmit}
          placeholder={t('dob-input.placeholder')}
        />
        <CountrySelect />
        <Button variant="primary" onPress={handleSubmit}>
          {t('cta')}
        </Button>
      </Box>
    </Container>
  );
};

const Row = styled.View`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    flex-direction: row;
  `}
`;

export default BasicInformation;
