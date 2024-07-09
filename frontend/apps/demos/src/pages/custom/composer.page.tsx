import { FootprintComponentKind } from '@onefootprint/footprint-js';
import footprint, { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { Box, CodeBlock, CodeInline, Text, createFontStyles } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

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
      onComplete: handleCompleted,
      onCancel: handleCanceled,
      variant: 'drawer',
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
  fontSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
  variant: 'drawer',
  variables: {
    fontFamily:
      '"Inter", ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
    colorAccent: '#3F83F7',
    containerWidth: '500px',
    containerBorder: '1px solid #101516',
    containerElevation:
      '0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.24) 0px 4px 24px 0px',
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
};
`;

const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY || '';

const handleOpen = () => {
  const component = footprint.init({
    kind: FootprintComponentKind.Verify,
    variant: 'drawer',
    publicKey,
    options: {
      showCompletionPage: true,
    },
    bootstrapData: {
      'id.email': 'rafael@onefootprint.com',
    },
    appearance: {
      fontSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      variant: 'drawer',
      variables: {
        fontFamily:
          '"Inter", ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        colorAccent: '#3F83F7',
        containerWidth: '500px',
        containerBorder: '1px solid #101516',
        containerElevation: '0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.24) 0px 4px 24px 0px',
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

  component.render();
};

const Composer = () => (
  <>
    <Head>
      <title>Footprint ❤️ Composer</title>
    </Head>
    <Grid>
      <Left>
        <Content>
          <Text variant="heading-3" marginBottom={4} tag="h2">
            Welcome to Footprint, Composer! 👋
          </Text>
          <Text variant="body-2" marginBottom={7} tag="h3">
            {`This is a step-by-step guide on how to integrate Footprint into your
            product as well as customize it to match your brand's look and feel.`}
          </Text>
          <Bullet>
            1. Go to the{' '}
            <Link href="https://dashboard.onefootprint.com" target="_blank">
              Footprint developer dashboard
            </Link>{' '}
            and create a new Playbook:
          </Bullet>
          <Bullet>
            2. Grab the Onboarding Publishable Key, for example <CodeInline>ob_test_VMooXd04EUlnu3AvMYKjMW</CodeInline>.
          </Bullet>
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
          <Text variant="body-2">
            6. You can find more information {` `}
            <Link href="https://docs.onefootprint.com/kyc-with-pii/react" target="_blank">
              here
            </Link>
            .
          </Text>
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
