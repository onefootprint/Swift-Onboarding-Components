import styled, { css } from '@onefootprint/styled';
import { ScrollArea, Shimmer } from '@onefootprint/ui';
import React from 'react';

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
  <Shimmer
    sx={{ width: '30px', height: '30px', position: 'absolute', left: '20px' }}
  />
);

const Title = () => <Shimmer sx={{ width: '120px', height: '25px' }} />;

const SectionTitle = () => (
  <Shimmer sx={{ width: '120px', height: '25px', marginBottom: 4 }} />
);

const Label = () => (
  <Shimmer sx={{ width: '70px', height: '20px', marginBottom: 3 }} />
);

const CardNumberInput = () => (
  <Shimmer sx={{ width: '100%', height: '40px' }} />
);

const CardExpDateInput = () => (
  <Shimmer sx={{ width: '100%', height: '40px' }} />
);

const CardCvc = () => <Shimmer sx={{ width: '100%', height: '40px' }} />;

const Form = styled.div`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[5]};
  `}
`;

const Button = () => <Shimmer sx={{ width: '100px', height: '40px' }} />;

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
