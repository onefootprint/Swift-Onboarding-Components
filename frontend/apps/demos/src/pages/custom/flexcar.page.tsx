import { FootprintComponentKind } from '@onefootprint/footprint-js';
import footprint, { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { Box, CodeBlock, CodeInline, Text, createFontStyles } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const publicKey = 'ob_test_rXIYpBLZBkoQkJRiOlm6or';

const installation = `npm install @onefootprint/footprint-js
`;

const basic = `import '@onefootprint/footprint-js/dist/footprint-js.css';
import { appearance, publicKey } from './config';
import footprint from '@onefootprint/footprint-js';

const Page = () => {
  const handleOpen = () => {
    const component = footprint.init({
      kind: 'verify',
      publicKey,
      appearance,
      onCompleted: handleCompleted,
      onCanceled: handleCanceled,
    });
    component.render();
  };

  const handleCompleted = (validationToken: string) => {
    // Send validationToken to your backend
    console.log(validationToken);
  };

  const handleCanceled = () => {
    console.log('user canceled');
  };

  return (
    <main>
      <button onClick={handleOpen}>Verify</button>
    </main>
  );
};
`;

const customization = `import { FootprintAppearance } from '@onefootprint/footprint-js';
export const publicKey = 'your-public-key';
export const appearance: FootprintAppearance = {
  fontSrc:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800&display=swap',
  variables: {
    fontFamily:
      '"Inter", Arial, ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',

    linkColor: '#2a00a5',
    borderRadius: '4px',
    linkButtonColor: '#2a00a5',

    colorAccent: '#1a0066',

    colorError: '#e43660',
    buttonBorderWidth: '0px',
    buttonPrimaryBg: '#1a0066',
    buttonPrimaryColor: '#FFFFFF',
    buttonPrimaryBorderColor: 'unset',
    buttonElevation:
      'rgba(10, 0, 41, 0.1) 0px 18px 50px, rgba(42, 0, 165, 0.06) 0px 8px 30px;',
    buttonPrimaryHoverBg: '#27039e',
    buttonBorderRadius: '32px',
    buttonPrimaryActiveBg: '#27039e',

    inputFocusElevation: 'unset',
    inputBorderWidth: '1.5px',
    inputHeight: '48px',
    inputBg: '#FFFFFF',
    inputBorderColor: '#d9dee8',
    inputColor: '#000',
    inputErrorBorderColor: '#e43660',
    hintErrorColor: '#ab173b',
    hintFont: '500 12px/18px "Inter"',

    inputErrorElevation: 'unset',
    colorWarning: '#e43660',

    inputFocusBg: '#FFF',
    inputFocusBorderColor: '#2a00a5',

    labelColor: '#0A0029',
    labelFont: '400 14px/20px "Inter"',
  },
  rules: {
    hint: {
      letterSpacing: '-0.33px',
    },
    button: {
      transition: 'background-color 0.3s ease 0s, color 0.3s ease 0s',
      textTransform: 'uppercase',
      font: '800 14px/20px "Inter"',
      letterSpacing: '1.5px',
    },
  },
};
`;

const handleOpen = () => {
  const component = footprint.init({
    kind: FootprintComponentKind.Verify,
    publicKey,
    options: {
      showCompletionPage: true,
    },
    appearance: {
      fontSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800&display=swap',
      variables: {
        fontFamily:
          '"Inter", Arial, ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',

        linkColor: '#2a00a5',
        borderRadius: '4px',
        linkButtonColor: '#2a00a5',

        colorAccent: '#1a0066',

        colorError: '#e43660',
        buttonBorderWidth: '0px',
        buttonPrimaryBg: '#1a0066',
        buttonPrimaryColor: '#FFFFFF',
        buttonPrimaryBorderColor: 'unset',
        buttonElevation: 'rgba(10, 0, 41, 0.1) 0px 18px 50px, rgba(42, 0, 165, 0.06) 0px 8px 30px;',
        buttonPrimaryHoverBg: '#27039e',
        buttonBorderRadius: '32px',
        buttonPrimaryActiveBg: '#27039e',

        inputFocusElevation: 'unset',
        inputBorderWidth: '1.5px',
        inputHeight: '48px',
        inputBg: '#FFFFFF',
        inputBorderColor: '#d9dee8',
        inputColor: '#000',
        inputErrorBorderColor: '#e43660',
        hintErrorColor: '#ab173b',
        hintFont: '500 12px/18px "Inter"',

        inputErrorElevation: 'unset',
        colorWarning: '#e43660',

        inputFocusBg: '#FFF',
        inputFocusBorderColor: '#2a00a5',

        labelColor: '#0A0029',
        labelFont: '400 14px/20px "Inter"',
      },
      rules: {
        hint: {
          letterSpacing: '-0.33px',
        },
        button: {
          transition: 'background-color 0.3s ease 0s, color 0.3s ease 0s',
          textTransform: 'uppercase',
          font: '800 14px/20px "Inter"',
          letterSpacing: '1.5px',
        },
      },
    },
    onCancel: () => {
      console.log('onCancel'); // eslint-disable-line no-console
    },
    onComplete: (validationToken: string) => {
      console.log('onComplete', validationToken); // eslint-disable-line no-console
    },
  });

  component.render();
};

const Flexcar = () => (
  <>
    <Head>
      <title>Footprint ❤️ Flexcar</title>
    </Head>
    <Grid>
      <Left>
        <Content>
          <Text variant="heading-3" marginBottom={4} tag="h2">
            Welcome to Footprint, Flexcar! 👋
          </Text>
          <Text variant="body-2" marginBottom={7} tag="h3">
            {`This is a step-by-step guide on how to integrate Footprint into your
            product as well as customize it to match your brand's look and feel.`}
          </Text>
          <Bullet>
            1. Go to the{` `}
            <Link href="https://dashboard.onefootprint.com" target="_blank">
              Footprint developer dashboard
            </Link>
            {` `}
            and create a new Playbook:
          </Bullet>
          <span>
            <Bullet>
              2. Grab the Onboarding Publishable Key, for example <CodeInline>{publicKey}</CodeInline>.
            </Bullet>
          </span>
          <Text variant="body-2">3. Install Footprint dependencies:</Text>
          <CodeBlock language="bash">{installation}</CodeBlock>
          <Text variant="body-2">4. Now, add to your app:</Text>
          <CodeBlock language="typescript">{basic}</CodeBlock>
          <Text variant="body-2">
            {`5. To use your brand styles, create a file named config.ts and add
            to it the content you see below. This is an initial version, but it
            should already be very close to your brand's look and feel. Feel
            free to adjust as you wish.`}
          </Text>
          <CodeBlock language="typescript">{customization}</CodeBlock>
        </Content>
      </Left>
      <Right>
        <ButtonContainer>
          <FootprintVerifyButton onClick={handleOpen} />
        </ButtonContainer>
      </Right>
    </Grid>
  </>
);

const Bullet = styled(Box)`
  ${createFontStyles('body-2')}
`;

const Grid = styled.div`
  ${({ theme }) => `
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 40px 0px;
  height: 100%;
  background-image: linear-gradient(
        to right,
        ${theme.backgroundColor.secondary} 50%,
        #fff 50%
      );
  `}
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Content = styled.div`
  margin: 0 auto;
  h2,
  h3 {
    max-width: 640px;
  }
  > p {
    width: 640px;
    margin-bottom: 16px;
  }
  > div {
    width: 640px;
    margin-bottom: 24px;
  }
`;

const Right = styled.div`
  display: flex;
  flex: 1;
`;

const ButtonContainer = styled.div`
  position: fixed;
  top: calc(50% - 24px);
  right: calc(25% - 122px);
`;

export default Flexcar;
