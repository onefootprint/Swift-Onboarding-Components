import { ScrollArea, Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Container from '../container';
import Grid from '../grid';

const Loading = () => (
  <Container
    header={
      <>
        <CloseButton />
        <Title />
      </>
    }
    footer={
      <FooterWrapper>
        <ButtonsContainer>
          <Button />
          <Button />
        </ButtonsContainer>
      </FooterWrapper>
    }
    testID="init-shimmer"
  >
    <div style={{ flexGrow: 1 }}>
      <ScrollArea>
        <Form>
          <SectionTitle />
          <Grid.Row>
            <Grid.Column col={12}>
              <Label />
              <CardNumberInput />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column col={6}>
              <Label />
              <CardExpDateInput />
            </Grid.Column>
            <Grid.Column col={6}>
              <Label />
              <CardCvc />
            </Grid.Column>
          </Grid.Row>
        </Form>
      </ScrollArea>
    </div>
  </Container>
);

const CloseButton = () => (
  <Shimmer height="30px" width="30px" position="absolute" left="20px" />
);

const Title = () => <Shimmer height="25px" width="120px" />;

const SectionTitle = () => (
  <Shimmer height="25px" width="120px" marginBottom={4} />
);

const Label = () => <Shimmer height="20px" width="70px" marginBottom={3} />;

const CardNumberInput = () => <Shimmer height="40px" width="100%" />;

const CardExpDateInput = () => <Shimmer height="40px" width="100%" />;

const CardCvc = () => <Shimmer height="40px" width="100%" />;

const Form = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[5]};
  `}
`;

const Button = () => <Shimmer height="40px" width="100px" />;

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    overflow: hidden;
    position: relative;
  `}
`;
const FooterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

export default Loading;
