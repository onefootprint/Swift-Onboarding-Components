import { NavigationHeader } from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

const ConfigInvalid = () => {
  const { t } = useTranslation('pages.config-invalid');
  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <Container>
        <Typography
          variant="heading-3"
          color="primary"
          sx={{ marginBottom: 3 }}
        >
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Container>
    </>
  );
};

const Container = styled.div`
  text-align: center;
`;

export default ConfigInvalid;
