import { COUNTRIES } from '@onefootprint/global-constants';
import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';

import { CountryRestriction } from '@/playbooks/utils/machine/types';

import type { ResidencyFormWithContextProps } from './residency.test.config';
import ResidencyFormWithContext from './residency.test.config';

const renderResidencyForm = ({
  onSubmit = jest.fn(),
  onBack = jest.fn(),
  defaultValues,
}: Partial<ResidencyFormWithContextProps>) => {
  customRender(<ResidencyFormWithContext onSubmit={onSubmit} onBack={onBack} defaultValues={defaultValues} />);
};

describe('<Residency />', () => {
  describe('default values', () => {
    describe('initial', () => {
      it('should show "US Residents" selected and "International" unselected', async () => {
        renderResidencyForm({});

        const usResidents = screen.getByRole('radio', {
          name: 'United States',
        });
        expect(usResidents).toBeChecked();

        // const usTerritories = screen.getByRole('checkbox', {
        //   name: 'Allow residents from U.S. territories to be onboarded',
        // });
        // expect(usTerritories).not.toBeChecked();

        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        expect(international).not.toBeChecked();
      });
    });

    describe('International', () => {
      it('should show "US Residents" and "International" selected and "US territories" unselected', async () => {
        renderResidencyForm({
          defaultValues: {
            allowInternationalResidents: true,
            allowUsResidents: false,
            allowUsTerritories: false,
          },
        });

        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        expect(international).toBeChecked();
      });
    });

    describe('US residents + US Territories', () => {
      it('should show "US Residents", "US territories" and "International" selected', async () => {
        renderResidencyForm({
          defaultValues: {
            allowInternationalResidents: false,
            allowUsResidents: true,
            allowUsTerritories: true,
          },
        });

        const usResidents = screen.getByRole('radio', {
          name: 'United States',
        });
        expect(usResidents).toBeChecked();

        const usTerritories = screen.getByRole('checkbox', {
          name: 'Allow residents from U.S. territories to be onboarded',
        });
        expect(usTerritories).toBeChecked();

        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        expect(international).not.toBeChecked();
      });
    });

    describe('International with specific restrictions', () => {
      it('should check "International" and "Restrict onboarding to specific countries"', async () => {
        renderResidencyForm({
          defaultValues: {
            allowUsResidents: false,
            allowUsTerritories: false,
            allowInternationalResidents: true,
            restrictCountries: CountryRestriction.restrict,
          },
        });

        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        expect(international).toBeChecked();

        const restrict = screen.getByRole('radio', {
          name: 'Restrict onboarding to specific countries',
        });
        expect(restrict).toBeChecked();
      });
    });
  });

  describe('when submitting the form', () => {
    describe('when only "US residents" is selected', () => {
      it('should call onSubmit with the correct values', async () => {
        const onSubmit = jest.fn();
        renderResidencyForm({ onSubmit });

        const submit = screen.getByRole('button', { name: 'Next' });
        await userEvent.click(submit);
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({
            allowInternationalResidents: false,
            allowUsResidents: true,
            allowUsTerritories: false,
            restrictCountries: CountryRestriction.all,
          }),
        );
      });
    });

    // TODO: https://linear.app/footprint/issue/FP-6072/playbooks-enable-us-territories
    // describe('when "US residents" and "US territories" is selected', () => {
    //   it('should call onSubmit with the correct values', async () => {
    //     const onSubmit = jest.fn();
    //     renderResidencyForm({ onSubmit });

    //     // const usTerritories = screen.getByRole('checkbox', {
    //     //   name: 'Allow residents from U.S. territories to be onboarded',
    //     // });
    //     // await userEvent.click(usTerritories);

    //     const submit = screen.getByRole('button', { name: 'Next' });
    //     await userEvent.click(submit);
    //     await waitFor(() =>
    //       expect(onSubmit).toHaveBeenCalledWith({
    //         allowInternationalResidents: false,
    //         allowUsResidents: true,
    //         allowUsTerritories: true,
    //         restrictCountries: CountryRestriction.all,
    //       }),
    //     );
    //   });
    // });

    describe('when initially "US residents", and then "International" are selected', () => {
      it('should call onSubmit with the correct values', async () => {
        const onSubmit = jest.fn();
        renderResidencyForm({ onSubmit });
        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        await userEvent.click(international);
        const submit = screen.getByRole('button', { name: 'Next' });
        await userEvent.click(submit);
        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({
            allowInternationalResidents: true,
            allowUsResidents: false,
            allowUsTerritories: false,
            restrictCountries: CountryRestriction.all,
          }),
        );
      });
    });

    describe('when initially "US Residents", "International" and "Restrict onboarding to specific countries" is selected', () => {
      it('should call onSubmit with the correct values', async () => {
        const onSubmit = jest.fn();
        renderResidencyForm({ onSubmit });

        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        await userEvent.click(international);

        const restrict = screen.getByRole('radio', {
          name: 'Restrict onboarding to specific countries',
        });
        await userEvent.click(restrict);

        const countriesSelect = screen.getByLabelText('Countries');
        await userEvent.type(countriesSelect, 'Chile');
        await userEvent.click(screen.getByText('Chile'));

        const submit = screen.getByRole('button', { name: 'Next' });
        await userEvent.click(submit);

        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({
            allowInternationalResidents: true,
            allowUsResidents: false,
            allowUsTerritories: false,
            restrictCountries: CountryRestriction.restrict,
            countryList: COUNTRIES.filter(country => country.value === 'CL'),
          }),
        );
      });
    });

    describe('when initially "US Residents" is unselected and "International" and is selected', () => {
      it('should call onSubmit with the correct values', async () => {
        const onSubmit = jest.fn();
        renderResidencyForm({ onSubmit });

        const unitedStates = screen.getByRole('radio', {
          name: 'United States',
        });
        await userEvent.click(unitedStates);

        const international = screen.getByRole('radio', {
          name: 'Other countries',
        });
        await userEvent.click(international);

        const submit = screen.getByRole('button', { name: 'Next' });
        await userEvent.click(submit);

        await waitFor(() =>
          expect(onSubmit).toHaveBeenCalledWith({
            allowInternationalResidents: true,
            allowUsResidents: false,
            allowUsTerritories: false,
            restrictCountries: CountryRestriction.all,
          }),
        );
      });
    });
  });
});
