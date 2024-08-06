import { Text } from '@onefootprint/ui';
import AnimatedSuccessCheck from '@onefootprint/ui/src/components/animated-success-check';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const LivenessSuccess = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'liveness.components.liveness-success',
  });

  return (
    <IconContainer>
      <AnimatedSuccessCheck animationStart />
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
