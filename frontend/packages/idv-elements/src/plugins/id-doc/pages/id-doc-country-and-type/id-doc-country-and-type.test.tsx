import { CountryRecord } from '@onefootprint/global-constants';
import { screen, userEvent, waitFor } from '@onefootprint/test-utils';
import {
  SubmitDocTypeResponse,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import renderPage from '../../test-utils/render-page';
import { MachineContext } from '../../utils/state-machine';
import IdDocCountryAndTypeContainer from './components/id-doc-country-and-type-container';
import {
  initialContextAllDocTypes,
  initialContextBD,
  initialContextNoSupportedDoc,
  initialContextOnlyUS,
  initialContextSomeDocTypes,
  withSubmitDocTypeAndCountry,
  withSubmitDocTypeAndCountryError,
} from './id-doc-country-and-type.test.config';

let submittedData: {
  id: string;
  country: CountryRecord;
  docType: SupportedIdDocTypes;
};

const handleSubmitDocTypeSuccess = (
  data: SubmitDocTypeResponse,
  country: CountryRecord,
  docType: SupportedIdDocTypes,
) => {
  const { id } = data;
  submittedData = { id, country, docType };
};

const renderFrontCountryAndDoc = (context: MachineContext) =>
  renderPage(
    context,
    <IdDocCountryAndTypeContainer
      onSubmitDocTypeSuccess={handleSubmitDocTypeSuccess}
    />,
  );

describe('<IdDocCountryAndType/>', () => {
  describe('Contains the UI element', () => {
    it('Contains the country selector', () => {
      renderFrontCountryAndDoc(initialContextAllDocTypes);
      const countrySelector = screen.getByTestId('country-selector');
      expect(countrySelector).toBeInTheDocument();
    });

    it('Contains the doc selector', () => {
      renderFrontCountryAndDoc(initialContextAllDocTypes);
      const docSelector = screen.getByTestId('doc-selector');
      expect(docSelector).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderFrontCountryAndDoc(initialContextAllDocTypes);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });
  });

  describe('Contains correct doc types', () => {
    it('US, all doc types', () => {
      renderFrontCountryAndDoc(initialContextAllDocTypes);

      const DL = screen.getByText("Driver's license");
      expect(DL).toBeInTheDocument();

      const ID = screen.getByText('Identity card');
      expect(ID).toBeInTheDocument();

      const passport = screen.getByText('Passport');
      expect(passport).toBeInTheDocument();

      const visa = screen.getByText('Visa');
      expect(visa).toBeInTheDocument();

      const residenceCard = screen.getByText('Residence card / Green card');
      expect(residenceCard).toBeInTheDocument();

      const workPermit = screen.getByText('Work permit / EAD card');
      expect(workPermit).toBeInTheDocument();
    });

    it('US, some doc types', () => {
      renderFrontCountryAndDoc(initialContextSomeDocTypes);

      const DL = screen.getByText("Driver's license");
      expect(DL).toBeInTheDocument();

      const ID = screen.getByText('Identity card');
      expect(ID).toBeInTheDocument();

      const passport = screen.getByText('Passport');
      expect(passport).toBeInTheDocument();

      const visa = screen.queryAllByText('Visa');
      expect(visa).toHaveLength(0);

      const residenceCard = screen.queryAllByText(
        'Residence card / Green card',
      );
      expect(residenceCard).toHaveLength(0);

      const workPermit = screen.queryAllByText('Work permit / EAD card');
      expect(workPermit).toHaveLength(0);
    });

    it('Non US', () => {
      renderFrontCountryAndDoc(initialContextBD);

      const passport = screen.getByText('Passport');
      expect(passport).toBeInTheDocument();

      const DL = screen.queryAllByText("Driver's license");
      expect(DL).toHaveLength(0);

      const ID = screen.queryAllByText('Identity card');
      expect(ID).toHaveLength(0);

      const visa = screen.queryAllByText('Visa');
      expect(visa).toHaveLength(0);

      const residenceCard = screen.queryAllByText(
        'Residence card / Green card',
      );
      expect(residenceCard).toHaveLength(0);

      const workPermit = screen.queryAllByText('Work permit / EAD card');
      expect(workPermit).toHaveLength(0);
    });
  });

  describe('Submits the correct doc and country', () => {
    beforeEach(() => {
      withSubmitDocTypeAndCountry();
    });
    it('Submits the correct doc and country', async () => {
      renderFrontCountryAndDoc(initialContextAllDocTypes);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
      await userEvent.click(continueButton);
      await waitFor(() => {
        expect(submittedData).toBeDefined();
      });
      expect(submittedData.id).toEqual('testID');
      expect(submittedData.country.value).toEqual('US');
      expect(submittedData.docType).toEqual(SupportedIdDocTypes.driversLicense);
    });
  });

  describe('Other tests', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => null);
    });
    it('Country selector is disabled for only US', async () => {
      renderFrontCountryAndDoc(initialContextOnlyUS);
      const onlyUSWarning = screen.getByText(
        'Only documents issued by United States of America are accepted',
      );
      expect(onlyUSWarning).toBeInTheDocument();

      const trigger = screen.getByRole('button', {
        name: 'United States of America',
      }) as HTMLButtonElement;
      expect(trigger.disabled).toBeTruthy();
    });

    it('Submit error', async () => {
      withSubmitDocTypeAndCountryError();
      renderFrontCountryAndDoc(initialContextAllDocTypes);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
      await userEvent.click(continueButton);
      await waitFor(() => {
        const errorMessage = screen.getByText('Something went wrong');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it("When a country doesn't have any supported doc type", async () => {
      renderFrontCountryAndDoc(initialContextNoSupportedDoc);
      const onlyUSWarning = screen.getByText(
        "Sorry, we don't support IDs for your country yet.",
      );
      expect(onlyUSWarning).toBeInTheDocument();
    });
  });
});
