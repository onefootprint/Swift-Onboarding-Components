import { customRender, screen } from '@onefootprint/test-utils';
import { type CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import CountrySpecific from './country-specific';

describe('CountrySpecific', () => {
  describe('when there are no country-specific rules', () => {
    it('renders the "none" case correctly', () => {
      customRender(<CountrySpecific countrySpecific={{}} />);
      const noneText = screen.getByText('No country-specific rules; all globally accepted documents are accepted.');
      expect(noneText).toBeInTheDocument();
    });
  });

  describe('when there are country-specific rules', () => {
    it('renders multiple countries with different document types', () => {
      const countrySpecific: Partial<Record<CountryCode, SupportedIdDocTypes[]>> = {
        AR: [SupportedIdDocTypes.passport, SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard],
        BR: [SupportedIdDocTypes.passport, SupportedIdDocTypes.voterIdentification],
      };

      customRender(<CountrySpecific countrySpecific={countrySpecific} />);
      const argentina = screen.getByText('Argentina');
      expect(argentina).toBeInTheDocument();
      const argentinaDocs = screen.getByText("Driver's license, ID card, Passport");
      expect(argentinaDocs).toBeInTheDocument();
      const brazil = screen.getByText('Brazil');
      expect(brazil).toBeInTheDocument();
      const brazilDocs = screen.getByText('Passport, Voter identification');
      expect(brazilDocs).toBeInTheDocument();
    });
  });
});
