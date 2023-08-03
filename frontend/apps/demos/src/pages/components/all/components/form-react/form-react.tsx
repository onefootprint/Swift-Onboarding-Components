import { FootprintFormType } from '@onefootprint/footprint-js';
import { FootprintForm } from '@onefootprint/footprint-react';
import styled from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';

const authToken = 'tok_SkgpMYfPAqkl3AaLrtsQsfNxKqxbWF88LN'; // process.env.NEXT_PUBLIC_COMPONENTS_AUTH_TOKEN as string;

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
        {/* <FootprintForm
          authToken={authToken}
          type={FootprintFormType.cardAndNameAndAddress}
          onComplete={() => console.log('complete')}
          onCancel={() => console.log('cancel')}
          onClose={() => console.log('close')}
        /> */}
        {isModalVisible && (
          <FootprintForm
            variant="modal"
            authToken={authToken}
            type={FootprintFormType.cardAndZip}
            onComplete={closeModal}
            onCancel={closeModal}
            onClose={closeModal}
          />
        )}
        {isDrawerVisible && (
          <FootprintForm
            variant="drawer"
            authToken={authToken}
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
