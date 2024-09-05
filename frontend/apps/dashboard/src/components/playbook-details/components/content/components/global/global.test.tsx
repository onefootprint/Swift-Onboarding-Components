import { customRender, screen } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import Global from './global';

describe('<Global />', () => {
  describe('when has documents', () => {
    it('renders the title and list of global document types, correctly concatenating with comma', () => {
      const globalDocs: SupportedIdDocTypes[] = [
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
      ];
      customRender(<Global global={globalDocs} />);
      const title = screen.getByText('Globally accepted doc scans');
      expect(title).toBeInTheDocument();
      const docs = screen.getByText(`ID card, Driver\'s license, Passport`);
      expect(docs).toBeInTheDocument();
    });

    it('renders "+ Selfie" when has selfie', () => {
      const globalDocs: SupportedIdDocTypes[] = [
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
      ];
      customRender(<Global global={globalDocs} hasSelfie={true} />);
      const docsWithSelfie = screen.getByText(`ID card, Driver\'s license, Passport + Selfie`);
      expect(docsWithSelfie).toBeInTheDocument();
    });
  });

  describe('when no documents are provided', () => {
    it('renders the title and "None"', () => {
      customRender(<Global />);
      const title = screen.getByText('Globally accepted doc scans');
      expect(title).toBeInTheDocument();
      const noDocs = screen.getByText('None');
      expect(noDocs).toBeInTheDocument();
    });
  });
});
