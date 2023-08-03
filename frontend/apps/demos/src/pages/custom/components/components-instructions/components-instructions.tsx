import {
  FootprintAppearance,
  FootprintFormType,
} from '@onefootprint/footprint-js';
import { FootprintForm } from '@onefootprint/footprint-react';
import styled from '@onefootprint/styled';
import { useToast } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);
  const toast = useToast();

  const handleLaunch = () => {
    setIsVisible(true);
  };

  const handleComplete = () => {
    const dashboardUrl = `https://dashboard.onefootprint.com/users/${userId}`;
    const dashboardLink = (
      <Link href={dashboardUrl}>your Footprint dashboard</Link>
    );
    toast.show({
      title: 'Payment method saved',
      description: (
        <span>
          User saved the payment method form. Please visit {dashboardLink} to
          decrypt and view.
        </span>
      ),
    });

    setIsVisible(false);
  };

  const handleClose = () => {
    toast.show({
      variant: 'error',
      title: 'Payment method not saved',
      description: 'User cancelled the payment method form',
    });

    setIsVisible(false);
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
        {isVisible && (
          <FootprintForm
            appearance={appearance}
            authToken={secretAuthToken}
            type={FootprintFormType.cardAndZip}
            variant={variant}
            title={title}
            onComplete={handleComplete}
            onClose={handleClose}
            onCancel={handleClose}
            options={{
              hideFootprintLogo: true,
            }}
          />
        )}
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
