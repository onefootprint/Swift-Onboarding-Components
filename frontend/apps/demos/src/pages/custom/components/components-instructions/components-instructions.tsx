import {
  FootprintAppearance,
  SecureFormType,
} from '@onefootprint/footprint-components-js';
import { FootprintSecureForm } from '@onefootprint/footprint-components-react';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  CodeBlock,
  CodeInline,
  LoadingIndicator,
  media,
  Typography,
} from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import useClientToken from 'src/hooks/use-client-token';
import { useEffectOnce } from 'usehooks-ts';

type ComponentsInstructionsProps = {
  tenantName: string;
  secretKey: string;
  userId: string;
  appearance: FootprintAppearance;
  cardAlias: string;
  title?: string;
  customCSS?: string;
  framework?: 'react' | 'vue';
};

const installation = `npm install @onefootprint/footprint-components-js`;

const createAuthTokenInstructions = ({
  secretKey,
  userId,
  cardAlias,
  ttl,
}: {
  secretKey: string;
  userId: string;
  cardAlias: string;
  ttl: number;
}) => `
  curl https://api.onefootprint.com/users/${userId}/client_token
      -X POST
      -u ${secretKey}:
      -d '{
            "fields": [
              "card.${cardAlias}.number",
              "card.${cardAlias}.cvc",
              "card.${cardAlias}.expiration",
              "card.${cardAlias}.billing_address.zip",
              "card.${cardAlias}.billing_address.country",
            ],
            "scopes": [
              "vault"
            ],
            "ttl": ${ttl}
        }'
  `;

const reactIntegration = `import '@onefootprint/footprint-components-js/dist/footprint-components-js.css';
import './app.css';
import { appearance } from './config';
import { FootprintSecureForm, SecureFormType } from '@onefooprint/footprint-components-react';

const secretKey = process.env.FOOTPRINT_API_SECRET_KEY;

type PaymentFormProps = {
  authToken: string;
  cardAlias: string;
  onSave: () => void;
  onClose: () => void;
};

const PaymentForm = ({
  authToken,
  cardAlias,
  onClose,
  onSave,
}: PaymentFormProps) => (
  <FootprintSecureForm
    appearance={appearance}
    authToken={authToken}
    cardAlias={cardAlias}
    type={SecureFormType.cardAndZip}
    variant="modal"
    onSave={onSave}
    onClose={onClose}
  />
);

export default PaymentForm;`;

const vueIntegration = `
<script>
import footprintComponents from '@onefootprint/footprint-components-js';
import { appearance } from './config';

export default {
  mounted() {
    footprintComponents.render({
      kind: 'secure-form',
      containerId: 'footprint-secure-form',
      props: {
        appearance,
        cardAlias: 'ANY_NICKNAME_FOR_CARD', // TODO:
        authToken: 'AUTH_TOKEN_GENERATED_FROM_API', // TODO:
        onSave: handleSave
      }
    })
  },
  methods: {
    handleSave() {
      // Called when user data is saved to the vault and you can decrypt from API
    }
  }
}
</script>

<template>
  <div class="card">
    <div id="footprint-secure-form"/>
  </div>
</template>
`;

type CustomizationProps = {
  appearance: FootprintAppearance;
};

const customization = ({
  appearance,
}: CustomizationProps) => `import { FootprintAppearance } from '@onefootprint/footprint-components-js';
export const appearance: FootprintAppearance = ${JSON.stringify(
  appearance,
  null,
  2,
)}
`;

const ComponentsInstructions = ({
  appearance,
  cardAlias = 'primary',
  title,
  tenantName,
  secretKey,
  userId,
  customCSS,
  framework = 'react',
}: ComponentsInstructionsProps) => {
  const clientTokenMutation = useClientToken();
  const authToken = clientTokenMutation.data?.token;
  const [isVisible, setIsVisible] = useState(false);

  useEffectOnce(() => {
    clientTokenMutation.mutate({
      userId,
      secretKey,
      cardAlias,
    });
  });

  if (!authToken) {
    return (
      <LoadingContainer>
        <LoadingIndicator />
      </LoadingContainer>
    );
  }

  const openModal = () => {
    setIsVisible(true);
  };

  const dismissModal = () => {
    setIsVisible(false);
  };

  return (
    <>
      <Head>
        <title>Footprint ❤️ {tenantName}</title>
      </Head>
      <Grid>
        <Left>
          <Content>
            <Typography variant="heading-3" sx={{ marginBottom: 4 }} as="h2">
              Welcome to Footprint, {tenantName}! 👋
            </Typography>
            <Typography variant="body-2" sx={{ marginBottom: 7 }} as="h3">
              {`This is a step-by-step guide on how to integrate Footprint Components into your
            product as well as customize it to match your brand's look and feel.`}
            </Typography>
            <Typography variant="body-2">
              1. Go to the{` `}
              <Link
                href="https://dashboard.onefootprint.com/developers?tab=api_keys"
                target="_blank"
              >
                Footprint developer dashboard
              </Link>
              {` `}
              and get or create a new Secret API Key with permissions to `Create
              and update users` and `Decrypt data (Card data)`:
            </Typography>
            <Typography variant="body-2">
              2. Grab the Secret API Key: <CodeInline>{secretKey}</CodeInline>
            </Typography>
            <Typography variant="body-2">
              3. Install Footprint dependencies:
            </Typography>
            <CodeBlock language="bash">{installation}</CodeBlock>
            <Typography variant="body-2">
              4. Generate an auth token using your secret token & footprint user
              Id:
            </Typography>
            <CodeBlock language="bash">
              {createAuthTokenInstructions({
                secretKey,
                userId,
                cardAlias,
                ttl: 1800,
              })}
            </CodeBlock>
            <Typography variant="body-2">5. Now, add to your app:</Typography>
            {framework === 'react' && (
              <CodeBlock language="typescript">{reactIntegration}</CodeBlock>
            )}
            {framework === 'vue' && (
              <CodeBlock language="typescript">{vueIntegration}</CodeBlock>
            )}
            <Typography variant="body-2">
              6. To use your brand styles, create a file named config.ts and add
              to it the content you see below. This is an initial version, but
              it should already be very close to your brand&apos;s look and
              feel. Feel free to adjust as you wish.
            </Typography>
            <CodeBlock language="typescript">
              {customization({ appearance })}
            </CodeBlock>
            {customCSS && (
              <>
                <Typography variant="body-2">
                  7. Last but not least, create an app.css file and add it to it
                  the content you see below. This is the code responsible for
                  handling the smooth drawer animation, and it lives in your
                  page, not in the iframe.
                </Typography>
                <CodeBlock language="css">{customCSS}</CodeBlock>
              </>
            )}
            <Typography variant="body-2" as="span">
              When the user&apos;s card data has been successfully saved to
              Footprint, the onSave callback will be called. You can use the
              Footprint User ID and Secret API Key to decrypt the data stored in
              the vault.
            </Typography>
          </Content>
          <MobileButtonContainer>
            <Button onClick={openModal}>Submit Payment</Button>
          </MobileButtonContainer>
        </Left>
        <Right>
          <DesktopButtonContainer>
            <Button onClick={openModal}>Submit Payment</Button>
          </DesktopButtonContainer>
        </Right>
        {isVisible && (
          <FootprintSecureForm
            appearance={appearance}
            authToken={authToken}
            cardAlias={cardAlias}
            type={SecureFormType.cardAndZip}
            variant="modal"
            title={title}
            onSave={dismissModal}
            onClose={dismissModal}
            onCancel={dismissModal}
          />
        )}
      </Grid>
    </>
  );
};

const LoadingContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Grid = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Left = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex: 1;
    padding: ${theme.spacing[10]} ${theme.spacing[5]};
    height: 100%;
    flex-direction: column;
    background-color: ${theme.backgroundColor.secondary};
    max-width: 900px;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[10]};
    `}
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    margin: auto;
    width: 100%;

    h2,
    h3 {
      max-width: calc(100vw - ${theme.spacing[8]});
    }
    > p {
      max-width: calc(100vw - ${theme.spacing[8]});
      margin-bottom: ${theme.spacing[5]};
    }
    > div {
      max-width: calc(100vw - ${theme.spacing[8]});
      margin-bottom: ${theme.spacing[7]};
    }

    ${media.greaterThan('md')`
      h2,
      h3 {
        max-width: 900px;
      }
      > p {
        max-width: 900px;
      }
      > div {
        max-width: 900px;
      }
    `}
  `}
`;

const Right = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 200px;
  height: 100%;

  ${media.lessThan('md')`
    display: none;
  `}
`;

const MobileButtonContainer = styled.div`
  ${({ theme }) => css`
    ${media.greaterThan('md')`
      display: none;
    `}
    margin-top: ${theme.spacing[7]};
    display: flex;
    justify-content: center;
  `}
`;

const DesktopButtonContainer = styled.div`
  ${({ theme }) => css`
    position: fixed;
    top: calc(50% - ${theme.spacing[5]});
    white-space: nowrap;
  `}
`;

export default ComponentsInstructions;
