import { useTranslation } from 'hooks';
import React from 'react';
import NavigationHeader from 'src/components/navigation-header';
import styled from 'styled-components';
import { Typography } from 'ui';

const TenantInvalid = () => {
  const { t } = useTranslation('pages.tenant-invalid');
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

export default TenantInvalid;
