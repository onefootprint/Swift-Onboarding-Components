import type { IdDocKind } from '@onefootprint/request-types/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import Global from './global';

describe('<Global />', () => {
  describe('when has documents', () => {
    it('renders the title and list of global document types, correctly concatenating with comma', () => {
      const globalDocs: IdDocKind[] = ['id_card', 'drivers_license', 'passport'];
      customRender(<Global global={globalDocs} />);
      const title = screen.getByText('Globally accepted doc scans');
      expect(title).toBeInTheDocument();
      const docs = screen.getByText(`Driver's license, ID card, Passport`);
      expect(docs).toBeInTheDocument();
    });

    it('renders selfie with correct styling', () => {
      const globalDocs: IdDocKind[] = ['id_card', 'drivers_license', 'passport'];
      customRender(<Global global={globalDocs} hasSelfie={true} />);
      const docs = screen.getByText(`Driver's license, ID card, Passport`);
      expect(docs).toBeInTheDocument();
      const plus = screen.getByText('+');
      expect(plus).toBeInTheDocument();
      expect(plus).toHaveClass('text-secondary');
      const selfie = screen.getByText('Selfie');
      expect(selfie).toBeInTheDocument();
      expect(selfie).toHaveClass('text-secondary');
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
