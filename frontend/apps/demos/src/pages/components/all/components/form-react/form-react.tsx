import { FootprintForm } from '@onefootprint/footprint-react';
import { Button } from '@onefootprint/ui';
import { useState } from 'react';
import { DEMO_FORM_AUTH_TOKEN } from 'src/config/constants';
import styled from 'styled-components';

const FormReactIntegration = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleEvent = (name: string) => {
    console.log(name);
    setIsDrawerVisible(false);
    setIsModalVisible(false);
  };

  return (
    <>
      <Button onClick={() => setIsModalVisible(true)}>Modal</Button>
      <Button onClick={() => setIsDrawerVisible(true)}>Drawer</Button>
      <Container>
        {isModalVisible && (
          <FootprintForm
            variant="modal"
            authToken={DEMO_FORM_AUTH_TOKEN ?? ''}
            onComplete={() => handleEvent('complete')}
            onCancel={() => handleEvent('cancel')}
            onClose={() => handleEvent('close')}
          />
        )}
        {isDrawerVisible && (
          <FootprintForm
            variant="drawer"
            authToken={DEMO_FORM_AUTH_TOKEN ?? ''}
            onComplete={() => handleEvent('complete')}
            onCancel={() => handleEvent('cancel')}
            onClose={() => handleEvent('close')}
          />
        )}
      </Container>
    </>
  );
};

const Container = styled.div`
  width: 500px;
  min-width: 500px;
  height: 500px;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default FormReactIntegration;
