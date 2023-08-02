import footprint, { FootprintButton } from '@onefootprint/footprint-react';
import styled from '@onefootprint/styled';
import { CodeBlock, CodeInline, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

const installation = `npm install @onefootprint/footprint-js
npm install @onefootprint/footprint-react
`;

const basic = `import '@onefootprint/footprint-js/dist/footprint-js.css';
import './app.css';
import { appearance, publicKey } from './config';
import { FootprintButton } from '@onefooprint/footprint-react';
const Page = () => {
  const handleCompleted = (validationToken: string) => {
    // Send validationToken to your backend
    console.log(validationToken);
  };
  const handleCanceled = () => {
    console.log('user canceled');
  };
  return (
    <main>
      <FootprintButton
        appearance={appearance}
        publicKey={publicKey}
        onCompleted={handleCompleted}
        onCanceled={handleCanceled}
      />
    </main>
  );
};
`;

const customization = `import { FootprintAppearance } from '@onefootprint/footprint-js';
export const publicKey = 'your-public-key';
export const appearance: FootprintAppearance = {
  fontSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
  variables: {
    fontFamily:
      '"Inter", ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    linkColor: '#3F83F7',
    borderRadius: '3px',
    linkButtonColor: '#3F83F7',
    colorError: '#FB5100',
    buttonBorderWidth: '1px',
    buttonPrimaryBg: '#1F86FF',
    buttonPrimaryColor: '#FFFFFF',
    buttonPrimaryBorderColor: '#1971DA',
    buttonElevation:
      'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(25, 113, 218, 0.2) 0px 2px 2px 0px',
    buttonPrimaryHoverBg: '#1971DA',
    inputFocusElevation: 'unset',
    inputPlaceholderColor: '#9DA3AF',
    inputBorderWidth: '1px',
    inputHeight: '48px',
    inputBg: '#E5E7EB',
    inputBorderColor: '#C6C9CC',
    inputColor: '#000',
    inputFocusBg: '#FFF',
    inputFocusBorderColor: '#000',
    labelColor: '#101516',
    labelFont: '500 14px/21px "Inter"',
  },
  rules: {
    container: {
      width: '460px',
      margin: 'unset',
      height: '100vh',
      maxHeight: 'unset',
      position: 'fixed',
      right: 0,
      border: '1px solid #101516',
      boxShadow:
        '0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.24) 0px 4px 24px 0px',
    },
    input: {
      transition: '0.15s all cubic-bezier(.4,0,.2,1)',
    },
  },
};
`;

const publicKey = 'ob_test_KYA0PU0awxnHKjzh9M849Y';

const handleOpen = () => {
  footprint.open({
    publicKey,
    options: {
      showCompletionPage: true,
    },
    appearance: {
      variant: 'drawer',
      fontSrc:
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      variables: {
        fontFamily:
          '"Inter", ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        linkColor: '#3F83F7',
        borderRadius: '3px',
        linkButtonColor: '#3F83F7',
        colorError: '#FB5100',
        buttonBorderWidth: '1px',
        buttonPrimaryBg: '#1F86FF',
        buttonPrimaryColor: '#FFFFFF',
        buttonPrimaryBorderColor: '#1971DA',
        buttonElevation:
          'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(25, 113, 218, 0.2) 0px 2px 2px 0px',
        buttonPrimaryHoverBg: '#1971DA',
        inputFocusElevation: 'unset',
        inputPlaceholderColor: '#9DA3AF',
        inputBorderWidth: '1px',
        inputHeight: '48px',
        inputBg: '#E5E7EB',
        inputBorderColor: '#C6C9CC',
        inputColor: '#000',
        inputFocusBg: '#FFF',
        inputFocusBorderColor: '#000',
        labelColor: '#101516',
        labelFont: '500 14px/21px "Inter"',
      },
      rules: {
        input: {
          transition: '0.15s all cubic-bezier(.4,0,.2,1)',
        },
      },
    },
  });
};

const Composer = () => (
  <>
    <Head>
      <title>Footprint ❤️ Composer</title>
    </Head>
    <Grid>
      <Left>
        <Content>
          <Typography variant="heading-3" sx={{ marginBottom: 4 }} as="h2">
            Welcome to Footprint, Composer! 👋
          </Typography>
          <Typography variant="body-2" sx={{ marginBottom: 7 }} as="h3">
            {`This is a step-by-step guide on how to integrate Footprint into your
            product as well as customize it to match your brand's look and feel.`}
          </Typography>
          <Typography variant="body-2">
            1. Go to the{' '}
            <Link href="https://dashboard.onefootprint.com" target="_blank">
              Footprint developer dashboard
            </Link>{' '}
            and create a new Onboarding configuration:
          </Typography>
          <Typography variant="body-2">
            2. Grab the Onboarding Publishable Key, for example{' '}
            <CodeInline>ob_test_VMooXd04EUlnu3AvMYKjMW</CodeInline>.
          </Typography>
          <Typography variant="body-2">
            3. Install Footprint dependencies:
          </Typography>
          <CodeBlock language="bash">{installation}</CodeBlock>
          <Typography variant="body-2">4. Now, add to your app:</Typography>
          <CodeBlock language="typescript">{basic}</CodeBlock>
          <Typography variant="body-2">
            {`5. To use your brand styles, create a file named config.ts and add
            to it the content you see below. This is an initial version, but it
            should already be very close to your brand's look and feel. Feel
            free to adjust as you wish.`}
          </Typography>
          <CodeBlock language="typescript">{customization}</CodeBlock>
          <Typography variant="body-2">
            6. You can find more information {` `}
            <Link
              href="https://docs.onefootprint.com/kyc-with-pii/react"
              target="_blank"
            >
              here
            </Link>
            .
          </Typography>
        </Content>
      </Left>
      <Right>
        <ButtonContainer>
          <FootprintButton onClick={handleOpen} />
        </ButtonContainer>
      </Right>
    </Grid>
  </>
);

const Grid = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 40px 0 0;
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

export default Composer;
