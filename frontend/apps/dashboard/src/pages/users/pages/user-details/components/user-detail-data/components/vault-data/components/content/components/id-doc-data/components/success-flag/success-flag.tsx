import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

const SuccessFlag = () => {
  const { t } = useTranslation('pages.user-details.user-info.id-doc');

  return (
    <Container>
      <IcoCheck16 color="success" />
      <Typography variant="body-3" color="success" sx={{ marginLeft: 2 }}>
        {t('success-flag')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SuccessFlag;
