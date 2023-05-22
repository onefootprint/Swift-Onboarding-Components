import { customRender, screen } from '@onefootprint/test-utils';
import { EntityKind } from '@onefootprint/types';
import React from 'react';
import Provider from 'src/components/entities/components/details/hooks/use-entity-context';

import FloatingBox, { FloatingBoxProps } from './floating-box';

type RenderProps = FloatingBoxProps & { kind: EntityKind };

const propsWithInsights: RenderProps = {
  kind: EntityKind.person,
  hasInsights: true,
  city: 'San Francisco',
  country: 'United States',
  hasBiometrics: true,
  ipAddress: '24.3.171.149',
  region: 'CA',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
};

const propsWithoutInsights: RenderProps = {
  kind: EntityKind.person,
  hasInsights: false,
  city: null,
  country: null,
  hasBiometrics: false,
  ipAddress: null,
  region: null,
  userAgent: null,
};

const propsWithoutBiometrics: RenderProps = {
  ...propsWithInsights,
  hasBiometrics: false,
};

const propsWithBusinessKind: RenderProps = {
  ...propsWithInsights,
  kind: EntityKind.business,
};

const renderFloatingBox = ({
  kind,
  hasInsights,
  city,
  country,
  hasBiometrics,
  ipAddress,
  region,
  userAgent,
}: RenderProps) =>
  customRender(
    <Provider kind={kind} listPath="">
      <FloatingBox
        hasInsights={hasInsights}
        city={city}
        country={country}
        hasBiometrics={hasBiometrics}
        ipAddress={ipAddress}
        region={region}
        userAgent={userAgent}
      />
    </Provider>,
  );

describe('<FloatingBox/>', () => {
  describe('Vault-only users', () => {
    it('Shows the right title for vault-only users', () => {
      renderFloatingBox(propsWithoutInsights);

      const title = screen.getByText('No device insights available');
      expect(title).toBeInTheDocument();
    });

    it('Shows the right body text for vault-only users', () => {
      renderFloatingBox(propsWithoutInsights);

      const bodyText = screen.getByText(
        'This is a "Vault only" user, so we don\'t have any device insights available.',
      );
      expect(bodyText).toBeInTheDocument();
    });

    it('Does not show ip, biometrics, region, country for vault-only users', () => {
      renderFloatingBox(propsWithoutInsights);

      const ipAddress = screen.queryAllByText('IP address');
      const biometrics = screen.queryAllByText('Biometrics');
      const region = screen.queryAllByText('Region');
      const country = screen.queryAllByText('Country');
      expect(ipAddress).toHaveLength(0);
      expect(biometrics).toHaveLength(0);
      expect(region).toHaveLength(0);
      expect(country).toHaveLength(0);
    });
  });

  describe('Users with device insights data', () => {
    it('Shows the right title with device info', () => {
      renderFloatingBox(propsWithInsights);

      const title = screen.getByText('Apple Macintosh, Mac OS 10.15.7');
      expect(title).toBeInTheDocument();
    });

    it('Shows the correct ip info', () => {
      renderFloatingBox(propsWithInsights);

      const ipTitle = screen.getByText('IP address');
      const ipAddress = screen.getByText('24.3.171.149');
      expect(ipTitle).toBeInTheDocument();
      expect(ipAddress).toBeInTheDocument();
    });

    it('Shows the correct region info', () => {
      renderFloatingBox(propsWithInsights);

      const regionTitle = screen.getByText('Region');
      const region = screen.getByText('San Francisco, CA');
      expect(regionTitle).toBeInTheDocument();
      expect(region).toBeInTheDocument();
    });

    it('Shows the correct country info', () => {
      renderFloatingBox(propsWithInsights);

      const countryTitle = screen.getByText('Country');
      const country = screen.getByText('United States');
      expect(countryTitle).toBeInTheDocument();
      expect(country).toBeInTheDocument();
    });

    it('Does not show biometrics when hasBiometrics flag is not set or entity kind is business', () => {
      renderFloatingBox(propsWithBusinessKind);
      expect(screen.queryAllByText('Biometrics')).toHaveLength(0);
    });

    it('Show verified biometrics correctly whe entity kind is person', () => {
      renderFloatingBox(propsWithoutBiometrics);
      expect(screen.getByText('Biometrics')).toBeInTheDocument();
      expect(screen.getByText('Not verified')).toBeInTheDocument();
    });

    it('Show unverified biometrics correctly whe entity kind is person', () => {
      renderFloatingBox(propsWithInsights);
      expect(screen.getByText('Biometrics')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
    });
  });
});
