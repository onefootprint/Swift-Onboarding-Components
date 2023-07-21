import { FootprintAppearance } from '@onefootprint/footprint-components-js';
import styled, { css } from '@onefootprint/styled';
import {
  Button,
  CodeBlock,
  CodeInline,
  InlineAlert,
  media,
  Typography,
} from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';

import {
  getAuthTokenRequest,
  getAuthTokenResponse,
} from './utils/get-auth-token';
import getCustomization from './utils/get-customization';
import { jsInstallation, reactInstallation } from './utils/get-installation';
import {
  getReactIntegration,
  getVueIntegration,
} from './utils/get-integration';

type LeftPaneProps = {
  tenantName: string;
  framework?: 'react' | 'vue';
  cardAlias: string;
  customCSS?: string;
  appearance: FootprintAppearance;
  userId: string;
  onLaunch: () => void;
};

const LeftPane = ({
  tenantName,
  cardAlias,
  customCSS,
  appearance,
  framework = 'react',
  userId,
  onLaunch,
}: LeftPaneProps) => {
  const secretKey = 'sk_live_taOfwlefnwno4infdFqR0VwYDk';

  return (
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
          and get or create a new Secret API Key with permissions to
          &quot;Create and update users&quot;.
        </Typography>
        <InlineAlert variant="warning">
          Treat this key like a sensitive password! Your API keys carry many
          privileges, so be sure to keep them secure! Do not post your secret
          keys in publicly accessible places like GitHub or client-side code
          like web front-ends.
        </InlineAlert>
        <Typography variant="body-2" sx={{ display: 'flex', gap: 3 }}>
          2. Grab the Secret API Key:{` `}
          <CodeInline>{secretKey}</CodeInline>
        </Typography>
        <Typography variant="body-2">
          3. Install Footprint dependencies:
        </Typography>
        {framework === 'react' ? (
          <CodeBlock language="bash">{reactInstallation}</CodeBlock>
        ) : (
          <CodeBlock language="bash">{jsInstallation}</CodeBlock>
        )}
        <Typography variant="body-2">
          4. Generate a Footprint user vault (if needed). More details on how to
          create a new vault can be found{` `}
          <Link
            href="https://docs.onefootprint.com/integrate/migrate-existing-data#more-guides-and-resources"
            target="_blank"
          >
            here
          </Link>
          .
        </Typography>
        <Typography variant="body-2">
          5. Generate an auth token using your secret token & footprint user ID:
        </Typography>
        <CodeBlock language="bash">
          {getAuthTokenRequest({
            secretKey,
            userId,
            cardAlias,
            ttl: 1800,
          })}
        </CodeBlock>
        <Typography variant="body-2">
          A sample response can be found below:
        </Typography>
        <CodeBlock language="json">{getAuthTokenResponse()}</CodeBlock>
        <Typography variant="body-2">
          {' '}
          The token returned will need to be passed into the Footprint component
          in the next step.
        </Typography>
        <Typography variant="body-2">
          6. To use your brand styles, create a file named config.ts and add to
          it the content you see below. This is an initial version, but it
          should already be very close to your brand&apos;s look and feel. Feel
          free to adjust as you wish.
        </Typography>
        <CodeBlock language="typescript">
          {getCustomization({ appearance })}
        </CodeBlock>
        <Typography variant="body-2">7. Now, add to your app:</Typography>
        {framework === 'react' && (
          <CodeBlock language="typescript">
            {getReactIntegration(cardAlias)}
          </CodeBlock>
        )}
        {framework === 'vue' && (
          <CodeBlock language="html">{getVueIntegration(cardAlias)}</CodeBlock>
        )}
        {customCSS && (
          <>
            <Typography variant="body-2">
              8. Last but not least, create an app.css file and add it to it the
              content you see below. This is the code responsible for handling
              the smooth drawer animation, and it lives in your page, not in the
              iframe.
            </Typography>
            <CodeBlock language="css">{customCSS}</CodeBlock>
          </>
        )}
        <Typography variant="body-2" as="span">
          When the user&apos;s card data has been successfully saved to
          Footprint, the onSave callback will be called. Later, you can decrypt
          the data from Footprint, more info can be found{' '}
          <Link
            href="https://docs.onefootprint.com/vault/apis#decrypt-data-from-a-users-vault"
            target="_blank"
          >
            here
          </Link>
        </Typography>
      </Content>
      <MobileButtonContainer>
        <Button onClick={onLaunch}>Submit Payment</Button>
      </MobileButtonContainer>
    </Left>
  );
};

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

export default LeftPane;
