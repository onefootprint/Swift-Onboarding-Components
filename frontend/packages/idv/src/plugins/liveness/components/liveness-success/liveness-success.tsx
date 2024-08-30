import { Text } from '@onefootprint/ui';
import { SuccessCheck } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const LivenessSuccess = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'liveness.components.liveness-success',
  });

  return (
    <IconContainer>
      <SuccessCheck animationStart />
      <Text variant="label-3" color="success" marginTop={5}>
        {t('label')}
      </Text>
    </IconContainer>
  );
};

const IconContainer = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default LivenessSuccess;
