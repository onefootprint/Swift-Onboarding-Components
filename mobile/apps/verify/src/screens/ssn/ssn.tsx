import { IcoShield40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Container,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

export type SsnPros = {
  onDone: () => void;
};

const Ssn = ({ onDone }: SsnPros) => {
  const { t } = useTranslation('pages.ssn');
  const ssnKind = 'ssn-full';

  return (
    <Container scroll>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <Box gap={7}>
        {ssnKind === 'ssn-full' ? (
          <TextInput
            // autoFocus
            blurOnSubmit
            enterKeyHint="send"
            label={t('ssn-input.full-ssn.label')}
            placeholder={t('ssn-input.full-ssn.placeholder')}
          />
        ) : (
          <TextInput
            // autoFocus
            blurOnSubmit
            enterKeyHint="send"
            label={t('ssn-input.last-4.label')}
            placeholder={t('ssn-input.last-4.placeholder')}
          />
        )}
        {ssnKind === 'ssn-full' && (
          <Disclaimer>
            <IcoShield40 />
            <Box gap={3} paddingTop={1} flex={1}>
              <Typography variant="label-3">{t('disclaimer.title')}</Typography>
              <Typography variant="body-3" color="secondary">
                {t('disclaimer.description')}
              </Typography>
            </Box>
          </Disclaimer>
        )}
        <Button variant="primary" onPress={onDone}>
          {t('cta')}
        </Button>
      </Box>
    </Container>
  );
};

const Disclaimer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    background: ${theme.backgroundColor.secondary};
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Ssn;
