import { useTranslation } from '@onefootprint/hooks';
import { IcoFootprint16 } from '@onefootprint/icons';
import styled, { css, keyframes } from '@onefootprint/styled';
import { Grid, media, ScrollArea, Shimmer, Typography } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Container id="footprint-container">
    <Header>
      <CloseButton />
      <Title />
    </Header>
    <div style={{ flexGrow: 1 }}>
      <ScrollArea sx={{ padding: 7 }}>
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
    <Footer>
      <SecuredByFootprint />
      <ButtonsContainer>
        <Button />
        <Button />
      </ButtonsContainer>
    </Footer>
  </Container>
);

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    padding: ${theme.spacing[4]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
  `}
`;

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

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    justify-content: stretch;
    width: 480px;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
    border-radius: ${theme.borderRadius.default};

    body[data-variant='modal'] & {
      box-shadow: ${theme.elevation[3]};
      border: none;
      height: 100%;
      width: 100%;
      border-radius: 0;
      margin: 0;

      ${media.greaterThan('md')`
        height: auto;
        max-width: calc(100% - (2 * ${theme.spacing[9]}));
        max-height: calc(100% - (2 * ${theme.spacing[9]}));
        margin: ${theme.spacing[9]};
        border-radius: ${theme.borderRadius.default};
        width: 480px;
    `}
    }

    body[data-variant='drawer'] & {
      box-shadow: ${theme.elevation[3]};
      border: none;
      border-radius: 0;
      height: 100vh;
      width: 100%;
      position: fixed;
      right: 0;

      ${media.greaterThan('md')`
        width: 480px;
        border-radius: 0;
    `}
    }
  `}
`;

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

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
    width: 100%;
    z-index: 1;
    position: sticky;
    bottom: 0;
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};
    position: relative;
    overflow: hidden;
  `}
`;

const SecuredByFootprint = () => {
  const { t } = useTranslation(
    'pages.secure-form.form-dialog.secured-by-footprint',
  );
  return (
    <SecuredByFootprintContainer>
      <IconContainer>
        <IcoFootprint16 color="quaternary" />
      </IconContainer>
      <TextContainer>
        <Typography variant="caption-1" color="quaternary">
          {t('label')}
        </Typography>
      </TextContainer>
    </SecuredByFootprintContainer>
  );
};

const IconContainer = styled.div`
  min-width: 16px;
`;

const blink = keyframes`
  100% {
    transform: translateX(100%);
  }
`;

const SecuredByFootprintContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  &::after {
    bottom: 0;
    content: '';
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(-100%);

    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0)
    );
    animation: ${blink} 2s infinite;
  }
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `}
`;

export default Loading;
