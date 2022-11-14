import { FootprintButton } from '@onefootprint/footprint-react';
import { Box, media, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

const Demo = () => {
  const [showConfirmation, setConfirmation] = useState(false);

  return (
    <>
      <Head>
        <title>Footprint Demo - Custom theme</title>
      </Head>
      <Container>
        <Inner>
          {showConfirmation ? (
            <Box>
              <Typography
                color="primary"
                sx={{ marginBottom: 7 }}
                variant="heading-2"
              >
                Onboarding complete!
              </Typography>
              <Typography color="secondary" variant="body-1" as="div">
                Thanks for trying Footprint. If you have any questions or want
                to learn more about our product, please contact us and we will
                get back to you as soon as possible.
              </Typography>
            </Box>
          ) : (
            <Content>
              <Typography variant="heading-2" sx={{ marginBottom: 7 }}>
                Help us verify your identity
              </Typography>
              <Typography color="secondary" variant="body-1" as="div">
                We will need to collect some personal information to confirm and
                protect your identity when you create your account at AcmeBank.
                To learn more about how we process this data, please see our
                privacy policy.
              </Typography>
              <Box sx={{ marginTop: 7 }}>
                <FootprintButton
                  appearance={{
                    fontSrc:
                      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
                    variables: {
                      fontFamily: '"Inter"',
                      linkColor: '#101010',
                      colorError: '#E33D19',

                      buttonPrimaryBg: '#315E4C',
                      buttonPrimaryHoverBg: '#46866c',
                      buttonPrimaryColor: '#FFF',
                      buttonBorderRadius: '70px',

                      linkButtonColor: '#315E4C',

                      labelColor: '#101010',
                      labelFont: '600 15px/18px "Inter"',

                      inputBorderRadius: '8px',
                      inputBorderWidth: '1px',
                      inputFont: '500 15px/21.42px "Inter"',
                      inputHeight: '50px',
                      inputPlaceholderColor: '#B5B5B5',
                      inputColor: '#101010',
                      inputBg: '#FFFFFF',
                      inputBorderColor: '#B5B5B5',
                      inputHoverBorderColor: '#707070',
                      inputFocusBorderColor: '#707070',
                      inputFocusElevation: 'none',
                      inputErrorFocusElevation: 'none',
                      hintColor: '#101010',
                      hintFont: '400 13px/20px "Inter"',

                      dropdownBorderColor: '#B5B5B5',
                      dropdownBorderRadius: '8px',
                      dropdownElevation: 'unset',
                      dropdownBg: '#FFF',
                      dropdownHoverBg: '#F9F9F9',
                    },
                    rules: {
                      button: {
                        transition: 'all .2s linear',
                      },
                    },
                  }}
                  publicKey={publicKey}
                  onCompleted={(validationToken: string) => {
                    setConfirmation(true);
                    console.log('on completed', validationToken);
                  }}
                  onCanceled={() => {
                    console.log('user canceled!');
                  }}
                />
              </Box>
            </Content>
          )}
        </Inner>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background: ${theme.backgroundColor.secondary};
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.compact};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[7]} ${theme.spacing[5]};
    text-align: center;
    width: 90%;

    ${media.greaterThan('sm')`
      max-width: 552px;
      padding: ${theme.spacing[9]};
    `}

    ${media.greaterThan('md')`
      max-width: 700px;
    `}
  `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default Demo;
