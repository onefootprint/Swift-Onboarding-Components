import type { FootprintAppearance } from '@onefootprint/footprint-js';
import { FootprintVerifyButton } from '@onefootprint/footprint-react';
import { CodeBlock, CodeInline, Text } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

type CustomizationProps = {
  appearance: FootprintAppearance;
};

const customization = ({ appearance }: CustomizationProps) => `import { FootprintAppearance } from '@onefootprint/footprint-js';
export const publicKey = 'your-public-key';
export const appearance: FootprintAppearance = ${JSON.stringify(appearance, null, 2)}
`;

const installation = `npm install @onefootprint/footprint-js
npm install @onefootprint/footprint-react
`;

const basic = `import '@onefootprint/footprint-js/dist/footprint-js.css';
import './app.css';
import { appearance, publicKey } from './config';
import { FootprintVerifyButton } from '@onefootprint/footprint-react';
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
      <FootprintVerifyButton
        appearance={appearance}
        publicKey={publicKey}
        onComplete={handleCompleted}
        onCancel={handleCanceled}
        options={{
          showCompletionPage: true,
        }}
      />
    </main>
  );
};`;

type TemplateProps = {
  appearance: FootprintAppearance;
  obKey: string;
  tenantName: string;
};

const OnboardingInstructions = ({ appearance, obKey, tenantName }: TemplateProps) => (
  <>
    <Head>
      <title>Footprint ❤️ {tenantName}</title>
    </Head>
    <Grid>
      <Left>
        <Content>
          <Text variant="heading-3" marginBottom={4} tag="h2">
            Welcome to Footprint, {tenantName}! 👋
          </Text>
          <Text variant="body-2" marginBottom={7} tag="h3">
            {`This is a step-by-step guide on how to integrate Footprint into your
            product as well as customize it to match your brand's look and feel.`}
          </Text>
          <Text variant="body-2">
            1. Go to the{` `}
            <Link href="https://dashboard.onefootprint.com" target="_blank">
              Footprint developer dashboard
            </Link>
            {` `}
            and create a new Playbook:
          </Text>
          <Text variant="body-2">
            2. Grab the Onboarding Publishable Key: <CodeInline>{obKey}</CodeInline>
          </Text>
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
          <CodeBlock language="typescript">{customization({ appearance })}</CodeBlock>
        </Content>
        <MobileButtonContainer>
          <FootprintVerifyButton
            appearance={appearance}
            publicKey={obKey}
            options={{
              showCompletionPage: true,
            }}
          />
        </MobileButtonContainer>
      </Left>
      <Right>
        <DesktopButtonContainer>
          <FootprintVerifyButton
            appearance={appearance}
            publicKey={obKey}
            options={{
              showCompletionPage: true,
            }}
          />
        </DesktopButtonContainer>
      </Right>
    </Grid>
  </>
);

const Grid = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Left = styled.div`
  ${({ theme }) => `
    display: flex;
    flex: 1;
    padding: 40px 0px;
    height: 100%;
    flex-direction: column;
    background-color: ${theme.backgroundColor.secondary};
    `}
`;

const Content = styled.div`
  ${({ theme }) => `
    margin: auto;
    padding: ${theme.spacing[5]};
    h2,
    h3 {
        max-width: 640px;
    }
    > p {
        max-width: 640px;
        margin-bottom: 16px;
    }
    > div {
        @media (max-width: 600px) {
            width: calc(100vw - ${theme.spacing[8]});
        }
        max-width: 640px;
        margin-bottom: 24px;
    } 
  `}
`;

const Right = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 400px;
  @media (max-width: 1075px) {
    display: none;
  }
`;

const MobileButtonContainer = styled.div`
  @media (min-width: 1076px) {
    display: none;
  }
  margin: auto;
`;

const DesktopButtonContainer = styled.div`
  position: fixed;
  top: calc(50% - 24px);
  white-space: nowrap;
`;

export default OnboardingInstructions;
