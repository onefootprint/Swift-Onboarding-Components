import type { FootprintAppearance } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { useToast } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

import LeftPane from './components/left-pane';
import RightPane from './components/right-pane';

type ComponentsInstructionsProps = {
  tenantName: string;
  appearance: FootprintAppearance;
  cardAlias: string;
  userId: string;
  secretAuthToken: string; // DO NOT render in the UI
  title?: string;
  customCSS?: string;
  framework?: 'react' | 'vue';
  variant: 'modal' | 'inline' | 'drawer';
};

const ComponentsInstructions = ({
  appearance,
  cardAlias = 'primary',
  title,
  secretAuthToken, // DO NOT render in the UI
  tenantName,
  customCSS,
  framework,
  userId,
  variant,
}: ComponentsInstructionsProps) => {
  const toast = useToast();

  const handleLaunch = () => {
    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      authToken: secretAuthToken,
      variant,
      title,
      appearance,
      onComplete: handleComplete,
      onClose: handleClose,
      onCancel: handleClose,
      options: {
        hideFootprintLogo: true,
      },
    });
    component.render();
  };

  const handleComplete = () => {
    const dashboardUrl = `https://dashboard.onefootprint.com/users/${userId}`;
    const dashboardLink = <Link href={dashboardUrl}>your Footprint dashboard</Link>;
    toast.show({
      title: 'Payment method saved',
      description: <span>User saved the payment method form. Please visit {dashboardLink} to decrypt and view.</span>,
    });
  };

  const handleClose = () => {
    toast.show({
      variant: 'error',
      title: 'Payment method not saved',
      description: 'User cancelled the payment method form',
    });
  };

  return (
    <>
      <Head>
        <title>Footprint ❤️ {tenantName}</title>
      </Head>
      <Grid>
        <LeftPane
          tenantName={tenantName}
          appearance={appearance}
          cardAlias={cardAlias}
          customCSS={customCSS}
          framework={framework}
          userId={userId}
          onLaunch={handleLaunch}
        />
        <RightPane onLaunch={handleLaunch} />
      </Grid>
    </>
  );
};

const Grid = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
`;

export default ComponentsInstructions;
