import { IcoCheckCircle40 } from '@onefootprint/icons';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Complete = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.complete' });

  return (
    <Container>
      <NavigationHeader />
      <IcoCheckCircle40 color="success" />
      <Box marginBottom={4} />
      <HeaderTitle
        display="flex"
        flexDirection="column"
        gap={4}
        subtitle={t('subtitle')}
        title={t('title')}
        zIndex={3}
      />
      <Box />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
`;

export default Complete;
