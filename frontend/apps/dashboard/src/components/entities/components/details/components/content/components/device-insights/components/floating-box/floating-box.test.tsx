import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { EntityKind } from '@onefootprint/types';
import React from 'react';
import Provider from 'src/components/entities/components/details/hooks/use-entity-context';

import type { FloatingBoxProps } from './floating-box';
import FloatingBox from './floating-box';

const renderFloatingBox = (
  kind: EntityKind,
  {
    hasInsights,
    city,
    country,
    hasBiometrics,
    ipAddress,
    region,
    userAgent,
    deviceInfo,
  }: FloatingBoxProps,
) =>
  customRender(
    <Provider kind={kind} listPath="">
      <FloatingBox
        city={city}
        country={country}
        deviceInfo={deviceInfo}
        hasBiometrics={hasBiometrics}
        hasInsights={hasInsights}
        ipAddress={ipAddress}
        region={region}
        userAgent={userAgent}
      />
    </Provider>,
  );

const renderFloatingBoxAsVaultUser = () => {
  const props: FloatingBoxProps = {
    deviceInfo: {
      appClip: false,
      instantApp: false,
      web: true,
    },
    hasInsights: false,
    city: null,
    country: null,
    hasBiometrics: false,
    ipAddress: null,
    region: null,
    userAgent: null,
  };
  return renderFloatingBox(EntityKind.person, props);
};

const renderFloatingBoxAsUser = (props?: Partial<FloatingBoxProps>) => {
  const floatingBoxProps: FloatingBoxProps = {
    deviceInfo: {
      appClip: false,
      instantApp: false,
      web: true,
    },
    hasInsights: true,
    city: 'San Francisco',
    country: 'United States',
    hasBiometrics: true,
    ipAddress: '24.3.171.149',
    region: 'CA',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    ...props,
  };
  return renderFloatingBox(EntityKind.person, floatingBoxProps);
};

describe('<FloatingBox/>', () => {
  describe('vault only users', () => {
    it('should show an empty state message', () => {
      renderFloatingBoxAsVaultUser();

      const title = screen.getByText('No device insights available');
      expect(title).toBeInTheDocument();
    });

    it('should not show information related with ip, region and country', () => {
      renderFloatingBoxAsVaultUser();

      const ipAddress = screen.queryByText('IP address');
      expect(ipAddress).not.toBeInTheDocument();

      const region = screen.queryByText('Region');
      expect(region).not.toBeInTheDocument();

      const country = screen.queryByText('Country');
      expect(country).not.toBeInTheDocument();
    });
  });

  describe('users with device insights', () => {
    it('should show the user agent', () => {
      renderFloatingBoxAsUser();

      const title = screen.getByText('Apple Macintosh, Mac OS 10.15.7');
      expect(title).toBeInTheDocument();
    });

    it('should show the ip', () => {
      renderFloatingBoxAsUser();

      const ipAddress = screen.getByText('24.3.171.149');
      expect(ipAddress).toBeInTheDocument();
    });

    it('should show the region', () => {
      renderFloatingBoxAsUser();

      const region = screen.getByText('San Francisco, CA');
      expect(region).toBeInTheDocument();
    });

    it('should show the country', () => {
      renderFloatingBoxAsUser();

      const country = screen.getByText('United States');
      expect(country).toBeInTheDocument();
    });

    describe('when the user did not do biometrics check', () => {
      it('should show it is not verified', () => {
        renderFloatingBoxAsUser({ hasBiometrics: false });
        expect(screen.getByText('Biometrics')).toBeInTheDocument();
        expect(screen.getByText('Not verified')).toBeInTheDocument();
      });
    });

    describe('when the user did biometrics check', () => {
      it('should show it is verified', () => {
        renderFloatingBoxAsUser({ hasBiometrics: true });
        expect(screen.getByText('Biometrics')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
      });
    });

    describe('when the user is using an instant app', () => {
      it('should show the instant app label', () => {
        renderFloatingBoxAsUser({
          deviceInfo: {
            appClip: false,
            instantApp: true,
            web: false,
          },
        });

        const title = screen.getByText('Instant App', { exact: false });
        expect(title).toBeInTheDocument();
      });

      describe("when clicking on the button 'What is this'", () => {
        it('should show the modal', async () => {
          renderFloatingBoxAsUser({
            deviceInfo: {
              appClip: false,
              instantApp: true,
              web: false,
            },
          });

          const button = screen.getByText("What's this?");
          await userEvent.click(button);

          const modal = screen.getByRole('dialog', {
            name: "What's an Instant App?",
          });
          expect(modal).toBeInTheDocument();
        });
      });
    });

    describe('when the user is using an app clip', () => {
      it('should show the app clip label', () => {
        renderFloatingBoxAsUser({
          deviceInfo: {
            appClip: true,
            instantApp: false,
            web: false,
          },
        });

        const title = screen.getByText('App Clip', { exact: false });
        expect(title).toBeInTheDocument();
      });

      describe("when clicking on the button 'What is this'", () => {
        it('should show the modal', async () => {
          renderFloatingBoxAsUser({
            deviceInfo: {
              appClip: true,
              instantApp: false,
              web: false,
            },
          });

          const button = screen.getByText("What's this?");
          await userEvent.click(button);

          const modal = screen.getByRole('dialog', {
            name: "What's an App Clip?",
          });
          expect(modal).toBeInTheDocument();
        });
      });
    });
  });
});
