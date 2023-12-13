import { IcoForbid40 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

const IncompatibleRequirementsError = () => {
  const { t } = useTranslation('pages.incompatible-requirements-error');

  return (
    <Box alignItems="center" gap={3} paddingLeft={5} paddingRight={5}>
      <IcoForbid40 color="error" />
      <WarningMessageContainer>
        <Typography variant="label-2" color="error" center>
          {t('title')}
        </Typography>
        <Typography variant="body-2" center>
          {t('description')}
        </Typography>
      </WarningMessageContainer>
    </Box>
  );
};

const WarningMessageContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[5]};
  `}
`;

export default IncompatibleRequirementsError;
