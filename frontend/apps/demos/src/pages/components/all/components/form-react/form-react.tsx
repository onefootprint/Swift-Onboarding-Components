import { FootprintFormType } from '@onefootprint/footprint-js';
import { FootprintForm } from '@onefootprint/footprint-react';
import styled from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import { COMPONENTS_AUTH_TOKEN } from 'src/config/constants';

const FormReactIntegration = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const closeModal = () => {
    setIsModalVisible(false);
  };
  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  return (
    <>
      <Button onClick={() => setIsModalVisible(true)}>Modal</Button>
      <Button onClick={() => setIsDrawerVisible(true)}>Drawer</Button>
      <Container>
        {isModalVisible && (
          <FootprintForm
            variant="modal"
            authToken={COMPONENTS_AUTH_TOKEN ?? ''}
            type={FootprintFormType.cardAndZip}
            onComplete={closeModal}
            onCancel={closeModal}
            onClose={closeModal}
          />
        )}
        {isDrawerVisible && (
          <FootprintForm
            variant="drawer"
            authToken={COMPONENTS_AUTH_TOKEN ?? ''}
            type={FootprintFormType.cardOnly}
            onComplete={closeDrawer}
            onCancel={closeDrawer}
            onClose={closeDrawer}
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
