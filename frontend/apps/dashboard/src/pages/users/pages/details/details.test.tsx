import {
  createFileSaverSpy,
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@onefootprint/test-utils';
import { DocumentDI, IdDI, InvestorProfileDI, UsLegalStatus, VisaKind } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

import Details from './details';
import {
  decryptFields,
  entityFixture,
  getInputByRow,
  getSelectOptionByRow,
  getTextByRow,
  openEditView,
  withAnnotations,
  withAuthEvents,
  withDecrypt,
  withDocuments,
  withEdit,
  withEntity,
  withEntityError,
  withRiskSignals,
  withTimeline,
} from './details.test.config';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

const useRouterSpy = createUseRouterSpy();
const fileSaverSpy = createFileSaverSpy();
const ENCRIPTED_TEXT = '••••••••••••';

describe.skip('<Details />', () => {
  const fileSaverMock = fileSaverSpy();

  beforeEach(() => {
    asAdminUser();
    useRouterSpy({
      pathname: `/users/${entityFixture.id}`,
      query: {
        id: entityFixture.id,
      },
    });
    withRiskSignals();
    withDocuments();
    withTimeline();
    withAuthEvents();
    withAnnotations();
  });

  afterAll(() => {
    resetUser();
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  const renderDetailsAndWaitData = async () => {
    renderDetails();

    await waitFor(() => {
      const content = screen.getByTestId('entity-content');
      expect(content).toBeInTheDocument();
    });

    await waitFor(() => {
      const decryptButton = screen.getByRole('button', {
        name: 'Decrypt',
      });
      expect(decryptButton).toBeInTheDocument();
    });
  };

  describe('when the request to fetch the users succeeds', () => {
    beforeEach(() => {
      withEntity();
    });

    it('should show a breadcrumb, with an option to return to the list pages', async () => {
      await renderDetailsAndWaitData();

      const breadcrumb = screen.getByLabelText('User details breadcrumb');
      expect(breadcrumb).toBeInTheDocument();

      const listLink = screen.getByRole('link', { name: 'Users' });
      expect(listLink).toBeInTheDocument();
      expect(listLink.getAttribute('href')).toEqual('/users');
    });

    it('should show a header with the entity status, and id', async () => {
      await renderDetailsAndWaitData();

      const header = screen.getByRole('banner', { name: 'User info' });
      expect(header).toBeInTheDocument();

      const status = within(header).getByText('Verified');
      expect(status).toBeInTheDocument();

      const id = within(header).getByText('fp_id_wL6XIWe26cRinucZrRK1yn');
      expect(id).toBeInTheDocument();
    });

    // TODO: Add vault data
    // https://linear.app/footprint/issue/FP-3505/add-user-vault-tests
    describe('vault', () => {
      describe('basic data section', () => {
        describe('before decryption', () => {
          it('should display the encrypted data', async () => {
            await renderDetailsAndWaitData();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            const firstName = getTextByRow({
              name: 'First name',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(firstName).toBeInTheDocument();

            const middleName = getTextByRow({
              name: 'Middle name',
              value: '-',
              container,
            });
            expect(middleName).toBeInTheDocument();

            const lastName = getTextByRow({
              name: 'Last name',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(lastName).toBeInTheDocument();

            const email = getTextByRow({
              name: 'Email',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(email).toBeInTheDocument();

            const phoneNumber = getTextByRow({
              name: 'Phone number',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(phoneNumber).toBeInTheDocument();
          });

          it('should dislay encrypted data when in edit state', async () => {
            await renderDetailsAndWaitData();
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            const firstName = getInputByRow({
              name: 'First name',
              container,
            });
            expect(firstName).toHaveValue(ENCRIPTED_TEXT);

            const middleName = getInputByRow({
              name: 'Middle name',
              container,
            });
            expect(middleName).toHaveValue('');

            const lastName = getInputByRow({
              name: 'Last name',
              container,
            });
            expect(lastName).toHaveValue(ENCRIPTED_TEXT);
          });
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.firstName]: 'Jane',
              [IdDI.lastName]: 'Doe',
              [IdDI.email]: 'jane.doe@acme.com',
              [IdDI.phoneNumber]: '12-3456789',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['First name', 'Last name', 'Email', 'Phone number']);
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            await waitFor(() => {
              const firstName = getTextByRow({
                name: 'First name',
                value: 'Jane',
                container,
              });
              expect(firstName).toBeInTheDocument();
            });

            await waitFor(() => {
              const lastName = getTextByRow({
                name: 'Last name',
                value: 'Doe',
                container,
              });
              expect(lastName).toBeInTheDocument();
            });

            await waitFor(() => {
              const email = getTextByRow({
                name: 'Email',
                value: 'jane.doe@acme.com',
                container,
              });
              expect(email).toBeInTheDocument();
            });

            await waitFor(() => {
              const phoneNumber = getTextByRow({
                name: 'Phone number',
                value: '12-3456789',
                container,
              });
              expect(phoneNumber).toBeInTheDocument();
            });
          });
        });

        describe('when clicking on the edit button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.firstName]: 'Jane',
              [IdDI.lastName]: 'Doe',
              [IdDI.email]: 'jane.doe@acme.com',
              [IdDI.phoneNumber]: '+15555550100',
            });
          });

          it("should show that email and phone number can't be edited", async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Email', 'Phone number']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            await waitFor(() => {
              const email = getTextByRow({
                name: 'Email',
                value: "Can't be edited",
                container,
              });
              expect(email).toBeInTheDocument();
            });
            await waitFor(() => {
              const phoneNumber = getTextByRow({
                name: 'Phone number',
                value: "Can't be edited",
                container,
              });
              expect(phoneNumber).toBeInTheDocument();
            });
          });

          it('should prefill name inputs with current data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['First name', 'Last name']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            await waitFor(() => {
              const firstName = getInputByRow({
                name: 'First name',
                container,
              });
              expect(firstName).toHaveValue('Jane');
            });
            await waitFor(() => {
              const middleName = getInputByRow({
                name: 'Middle name',
                container,
              });
              expect(middleName).toHaveValue('');
            });
            await waitFor(() => {
              const lastName = getInputByRow({
                name: 'Last name',
                container,
              });
              expect(lastName).toHaveValue('Doe');
            });
          });

          it('should edit first and last names correctly', async () => {
            withEdit(entityFixture.id, {
              [IdDI.firstName]: 'Edited first',
              [IdDI.lastName]: 'Edited last',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['First name', 'Last name']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            const firstName = getInputByRow({
              name: 'First name',
              container,
            });
            await userEvent.clear(firstName);
            await waitFor(() => {
              expect(firstName).toHaveValue('');
            });
            await userEvent.type(firstName, 'Edited first');
            await waitFor(() => {
              expect(firstName).toHaveValue('Edited first');
            });

            const lastName = getInputByRow({
              name: 'Last name',
              container,
            });
            await userEvent.clear(lastName);
            await waitFor(() => {
              expect(lastName).toHaveValue('');
            });
            await userEvent.type(lastName, 'Edited last');
            await waitFor(() => {
              expect(lastName).toHaveValue('Edited last');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newFirstName = getTextByRow({
                name: 'First name',
                value: 'Edited first',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newFirstName).toBeInTheDocument();
            });
            await waitFor(() => {
              const newLastName = getTextByRow({
                name: 'Last name',
                value: 'Edited last',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newLastName).toBeInTheDocument();
            });
          });

          it('should add a middle name correctly', async () => {
            withEdit(entityFixture.id, {
              [IdDI.middleName]: 'Edited middle',
            });
            await renderDetailsAndWaitData();
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            const middleName = getInputByRow({
              name: 'Middle name',
              container,
            });
            await userEvent.type(middleName, 'Edited middle');
            await waitFor(() => {
              expect(middleName).toHaveValue('Edited middle');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newMiddleName = getTextByRow({
                name: 'Middle name',
                value: 'Edited middle',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newMiddleName).toBeInTheDocument();
            });
          });

          it('should require first and last name', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['First name', 'Last name']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            const firstName = getInputByRow({
              name: 'First name',
              container,
            });
            await userEvent.clear(firstName);
            await waitFor(() => {
              expect(firstName).toHaveValue('');
            });

            const lastName = getInputByRow({
              name: 'Last name',
              container,
            });
            await userEvent.clear(lastName);
            await waitFor(() => {
              expect(lastName).toHaveValue('');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);

            await waitFor(() => {
              const newFirstName = getTextByRow({
                name: 'First name',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newFirstName).toBeInTheDocument();
            });
            await waitFor(() => {
              const newLastName = getTextByRow({
                name: 'Last name',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newLastName).toBeInTheDocument();
            });
          });

          it('should validate that names do not contain special characters', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['First name', 'Last name']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Basic data',
            });

            const firstName = getInputByRow({
              name: 'First name',
              container,
            });
            await userEvent.clear(firstName);
            await waitFor(() => {
              expect(firstName).toHaveValue('');
            });
            await userEvent.type(firstName, '@#!$');
            await waitFor(() => {
              expect(firstName).toHaveValue('@#!$');
            });

            const middleName = getInputByRow({
              name: 'Middle name',
              container,
            });
            await userEvent.clear(middleName);
            await waitFor(() => {
              expect(middleName).toHaveValue('');
            });
            await userEvent.type(middleName, 'aaa ^^');
            await waitFor(() => {
              expect(middleName).toHaveValue('aaa ^^');
            });

            const lastName = getInputByRow({
              name: 'Last name',
              container,
            });
            await userEvent.clear(lastName);
            await waitFor(() => {
              expect(lastName).toHaveValue('');
            });
            await userEvent.type(lastName, ':');
            await waitFor(() => {
              expect(lastName).toHaveValue(':');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);

            await waitFor(() => {
              const newFirstName = getTextByRow({
                name: 'First name',
                value: 'Cannot contain special characters',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newFirstName).toBeInTheDocument();
            });
            await waitFor(() => {
              const newMiddleName = getTextByRow({
                name: 'Middle name',
                value: 'Cannot contain special characters',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newMiddleName).toBeInTheDocument();
            });
            await waitFor(() => {
              const newLastName = getTextByRow({
                name: 'Last name',
                value: 'Cannot contain special characters',
                container: screen.getByRole('group', {
                  name: 'Basic data',
                }),
              });
              expect(newLastName).toBeInTheDocument();
            });
          });
        });
      });

      describe('address section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Address data',
          });

          await waitFor(() => {
            const addressLine1 = getTextByRow({
              name: 'Address line 1',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(addressLine1).toBeInTheDocument();
          });

          await waitFor(() => {
            const addressLine2 = getTextByRow({
              name: 'Address line 2',
              value: '-',
              container,
            });
            expect(addressLine2).toBeInTheDocument();
          });

          await waitFor(() => {
            const city = getTextByRow({
              name: 'City',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(city).toBeInTheDocument();
          });

          await waitFor(() => {
            const zipCode = getTextByRow({
              name: 'Zip code',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(zipCode).toBeInTheDocument();
          });

          await waitFor(() => {
            const state = getTextByRow({
              name: 'State',
              value: ENCRIPTED_TEXT,
              container,
            });
            expect(state).toBeInTheDocument();
          });
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.country]: 'US',
              [IdDI.addressLine1]: '14 Linda Street',
              [IdDI.city]: 'West Haven',
              [IdDI.zip]: '06516',
              [IdDI.state]: 'CT',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Country', 'Address line 1', 'City', 'Zip code', 'State']);
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            await waitFor(() => {
              const country = getTextByRow({
                name: 'Country',
                value: 'US',
                container,
              });
              expect(country).toBeInTheDocument();
            });

            await waitFor(() => {
              const addressLine1 = getTextByRow({
                name: 'Address line 1',
                value: '14 Linda Street',
                container,
              });
              expect(addressLine1).toBeInTheDocument();
            });

            await waitFor(() => {
              const city = getTextByRow({
                name: 'City',
                value: 'West Haven',
                container,
              });
              expect(city).toBeInTheDocument();
            });

            await waitFor(() => {
              const zipCode = getTextByRow({
                name: 'Zip code',
                value: '06516',
                container,
              });
              expect(zipCode).toBeInTheDocument();
            });

            await waitFor(() => {
              const state = getTextByRow({
                name: 'State',
                value: 'CT',
                container,
              });
              expect(state).toBeInTheDocument();
            });
          });
        });

        describe('when clicking on the edit button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.country]: 'US',
              [IdDI.addressLine1]: '14 Linda Street',
              [IdDI.city]: 'West Haven',
              [IdDI.zip]: '06516',
              [IdDI.state]: 'CT',
            });
          });

          it('should prefill input fields with current data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Country', 'Address line 1', 'City', 'Zip code', 'State']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            await waitFor(() => {
              const country = getSelectOptionByRow({
                rowName: 'Country',
                optionName: 'United States of America',
                container,
              });
              expect(country.selected).toBe(true);
            });

            await waitFor(() => {
              const line1 = getInputByRow({
                name: 'Address line 1',
                container,
              });
              expect(line1).toHaveValue('14 Linda Street');
            });

            await waitFor(() => {
              const line2 = getInputByRow({
                name: 'Address line 2',
                container,
              });
              expect(line2).toHaveValue('');
            });

            await waitFor(() => {
              const city = getInputByRow({
                name: 'City',
                container,
              });
              expect(city).toHaveValue('West Haven');
            });

            await waitFor(() => {
              const zip = getInputByRow({
                name: 'Zip code',
                container,
              });
              expect(zip).toHaveValue('06516');
            });
          });

          it('should edit to be a domestic address correctly', async () => {
            withEdit(entityFixture.id, {
              [IdDI.addressLine1]: 'Edited line 1',
              [IdDI.city]: 'Edited city',
              [IdDI.zip]: '94105',
              [IdDI.state]: 'CA',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['Country', 'Address line 1', 'City', 'Zip code', 'State']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            const line1 = getInputByRow({
              name: 'Address line 1',
              container,
            });
            await userEvent.clear(line1);
            await waitFor(() => {
              expect(line1).toHaveValue('');
            });
            await userEvent.type(line1, 'Edited line 1');
            await waitFor(() => {
              expect(line1).toHaveValue('Edited line 1');
            });

            const city = getInputByRow({
              name: 'City',
              container,
            });
            await userEvent.clear(city);
            await waitFor(() => {
              expect(city).toHaveValue('');
            });
            await userEvent.type(city, 'Edited city');
            await waitFor(() => {
              expect(city).toHaveValue('Edited city');
            });

            const zip = getInputByRow({
              name: 'Zip code',
              container,
            });
            await userEvent.clear(zip);
            await waitFor(() => {
              expect(zip).toHaveValue('');
            });
            await userEvent.type(zip, '94105');
            await waitFor(() => {
              expect(zip).toHaveValue('94105');
            });

            const state = within(container).getByRole('combobox', {
              name: 'state',
            });
            const option = within(state).getByRole('option', {
              name: 'California',
            });
            await userEvent.selectOptions(state, option);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'State',
                  optionName: 'California',
                  container,
                }).selected,
              ).toBe(true);
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newLine1 = getTextByRow({
                name: 'Address line 1',
                value: 'Edited line 1',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newLine1).toBeInTheDocument();
            });
            await waitFor(() => {
              const newCity = getTextByRow({
                name: 'City',
                value: 'Edited city',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newCity).toBeInTheDocument();
            });
            await waitFor(() => {
              const newZip = getTextByRow({
                name: 'Zip code',
                value: '94105',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newZip).toBeInTheDocument();
            });
            await waitFor(() => {
              const newState = getTextByRow({
                name: 'State',
                value: 'California',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newState).toBeInTheDocument();
            });
          });

          it('should edit to be an international address correctly', async () => {
            withEdit(entityFixture.id, {
              [IdDI.country]: 'AD',
              [IdDI.zip]: 'AD300',
              [IdDI.state]: 'Canillo',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['Country', 'Address line 1', 'City', 'Zip code', 'State']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            const country = within(container).getByRole('combobox', {
              name: 'address country',
            });
            const option = within(country).getByRole('option', {
              name: 'Andorra',
            });
            await userEvent.selectOptions(country, option);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Country',
                  optionName: 'Andorra',
                  container,
                }).selected,
              ).toBe(true);
            });

            const zip = getInputByRow({
              name: 'Zip code',
              container,
            });
            await userEvent.clear(zip);
            await waitFor(() => {
              expect(zip).toHaveValue('');
            });
            await userEvent.type(zip, 'AD300');
            await waitFor(() => {
              expect(zip).toHaveValue('AD300');
            });

            const state = getInputByRow({
              name: 'State',
              container,
            });
            await userEvent.clear(state);
            await waitFor(() => {
              expect(state).toHaveValue('');
            });
            await userEvent.type(state, 'Canillo');
            await waitFor(() => {
              expect(state).toHaveValue('Canillo');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newCountry = getTextByRow({
                name: 'Country',
                value: 'AD',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newCountry).toBeInTheDocument();
            });
            await waitFor(() => {
              const newZip = getTextByRow({
                name: 'Zip code',
                value: 'AD300',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newZip).toBeInTheDocument();
            });
            await waitFor(() => {
              const newState = getTextByRow({
                name: 'State',
                value: 'Canillo',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newState).toBeInTheDocument();
            });
          });

          it('should add Address Line 2 correctly', async () => {
            withEdit(entityFixture.id, {
              [IdDI.addressLine2]: 'Edited line 2',
            });
            await renderDetailsAndWaitData();
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            const line2 = getInputByRow({
              name: 'Address line 2',
              container,
            });
            await userEvent.type(line2, 'Edited line 2');
            await waitFor(() => {
              expect(line2).toHaveValue('Edited line 2');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newLine2 = getTextByRow({
                name: 'Address line 2',
                value: 'Edited line 2',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newLine2).toBeInTheDocument();
            });
          });

          it('should require all fields except line 2 for domestic', async () => {
            withEdit(entityFixture.id, {
              [IdDI.addressLine1]: '',
              [IdDI.city]: '',
              [IdDI.zip]: '',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['Country', 'Address line 1', 'City', 'Zip code', 'State']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            const line1 = getInputByRow({
              name: 'Address line 1',
              container,
            });
            await userEvent.clear(line1);
            await waitFor(() => {
              expect(line1).toHaveValue('');
            });

            const city = getInputByRow({
              name: 'City',
              container,
            });
            await userEvent.clear(city);
            await waitFor(() => {
              expect(city).toHaveValue('');
            });

            const zip = getInputByRow({
              name: 'Zip code',
              container,
            });
            await userEvent.clear(zip);
            await waitFor(() => {
              expect(zip).toHaveValue('');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);

            await waitFor(() => {
              const newLine1 = getTextByRow({
                name: 'Address line 1',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newLine1).toBeInTheDocument();
            });
            await waitFor(() => {
              const newCity = getTextByRow({
                name: 'City',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newCity).toBeInTheDocument();
            });
            await waitFor(() => {
              const newZip = getTextByRow({
                name: 'Zip code',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newZip).toBeInTheDocument();
            });
          });

          it('should validate that line 1 is not a PO box', async () => {
            withEdit(entityFixture.id, {
              [IdDI.addressLine1]: 'po box 5',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['Address line 1']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Address data',
            });

            const line1 = getInputByRow({
              name: 'Address line 1',
              container,
            });
            await userEvent.clear(line1);
            await waitFor(() => {
              expect(line1).toHaveValue('');
            });
            await userEvent.type(line1, 'po box 5');
            await waitFor(() => {
              expect(line1).toHaveValue('po box 5');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);

            await waitFor(() => {
              const newLine1 = getTextByRow({
                name: 'Address line 1',
                value: 'Must be a residential address',
                container: screen.getByRole('group', {
                  name: 'Address data',
                }),
              });
              expect(newLine1).toBeInTheDocument();
            });
          });
        });
      });

      describe.skip('card data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Payment card data',
          });

          const number = getTextByRow({
            name: 'Number',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(number).toBeInTheDocument();

          const numberLast4 = getTextByRow({
            name: 'Number (Last 4)',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(numberLast4).toBeInTheDocument();

          const expiration = getTextByRow({
            name: 'Expiration',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(expiration).toBeInTheDocument();

          const cvc = getTextByRow({
            name: 'CVC',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(cvc).toBeInTheDocument();

          const issuer = getTextByRow({
            name: 'Issuer',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(issuer).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              'card.primary.issuer': 'visa',
              'card.primary.number': '4916975755030283',
              'card.primary.expiration': '02/25',
              'card.primary.cvc': '123',
              'card.primary.number_last4': '0283',
              'card.primary.name': 'John Doe',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['Issuer', 'Number (Last 4)', 'CVC']);
            const container = screen.getByRole('group', {
              name: 'Payment card data',
            });

            await waitFor(() => {
              const issuer = getTextByRow({
                name: 'Issuer',
                value: 'visa',
                container,
              });
              expect(issuer).toBeInTheDocument();
            });

            await waitFor(() => {
              const numberLast4 = getTextByRow({
                name: 'Number (Last 4)',
                value: '0283',
                container,
              });
              expect(numberLast4).toBeInTheDocument();
            });

            await waitFor(() => {
              const CVC = getTextByRow({
                name: 'CVC',
                value: '123',
                container,
              });
              expect(CVC).toBeInTheDocument();
            });
          });
        });
      });

      describe('identity data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Identity data',
          });

          const ssn9 = getTextByRow({
            name: 'SSN (Full)',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(ssn9).toBeInTheDocument();

          const ssn4 = getTextByRow({
            name: 'SSN (Last 4)',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(ssn4).toBeInTheDocument();

          const dob = getTextByRow({
            name: 'Date of birth',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(dob).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.ssn4]: '6789',
              [IdDI.ssn9]: '123456789',
              [IdDI.dob]: '1967-09-29',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields(['SSN (Full)', 'SSN (Last 4)', 'Date of birth']);
            const container = screen.getByRole('group', {
              name: 'Identity data',
            });

            await waitFor(() => {
              const ssn9 = getTextByRow({
                name: 'SSN (Full)',
                value: '123-45-6789',
                container,
              });
              expect(ssn9).toBeInTheDocument();
            });

            await waitFor(() => {
              const ssn4 = getTextByRow({
                name: 'SSN (Last 4)',
                value: '6789',
                container,
              });
              expect(ssn4).toBeInTheDocument();
            });

            await waitFor(() => {
              const dob = getTextByRow({
                name: 'Date of birth',
                value: '1967-09-29',
                container,
              });
              expect(dob).toBeInTheDocument();
            });
          });
        });

        describe('when clicking on the edit button', () => {
          it('should prefill input fields with current data and show ssn4 as uneditable with an ssn9 present', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.ssn4]: '6789',
              [IdDI.ssn9]: '123456789',
              [IdDI.dob]: '1967-09-29',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['SSN (Full)', 'SSN (Last 4)', 'Date of birth']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Identity data',
            });

            await waitFor(() => {
              const ssn9 = getInputByRow({
                name: 'SSN (Full)',
                container,
              });
              expect(ssn9).toHaveValue('123456789');
            });
            await waitFor(() => {
              const ssn4 = getTextByRow({
                name: 'SSN (Last 4)',
                value: "Can't be edited",
                container,
              });
              expect(ssn4).toBeInTheDocument();
            });
            await waitFor(() => {
              const dob = getInputByRow({
                name: 'Date of birth',
                container,
              });
              expect(dob).toHaveValue('1967-09-29');
            });
          });

          it('should edit ssn4 and dob correctly', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.ssn4]: '6789',
              [IdDI.dob]: '1967-09-29',
            });
            withEdit(entityFixture.id, {
              [IdDI.ssn4]: '1234',
              [IdDI.dob]: '1991-11-27',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['SSN (Last 4)', 'Date of birth']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Identity data',
            });

            const ssn4 = getInputByRow({
              name: 'SSN (Last 4)',
              container,
            });
            await userEvent.clear(ssn4);
            await waitFor(() => {
              expect(ssn4).toHaveValue('');
            });
            await userEvent.type(ssn4, '1234');
            await waitFor(() => {
              expect(ssn4).toHaveValue('1234');
            });

            const dob = getInputByRow({
              name: 'Date of birth',
              container,
            });
            await userEvent.clear(dob);
            await waitFor(() => {
              expect(dob).toHaveValue('');
            });
            await userEvent.type(dob, '1991-11-27');
            await waitFor(() => {
              expect(dob).toHaveValue('1991-11-27');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newSsn = getTextByRow({
                name: 'SSN (Last 4)',
                value: '1234',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newSsn).toBeInTheDocument();
            });
            await waitFor(() => {
              const newDob = getTextByRow({
                name: 'Date of birth',
                value: '1991-11-27',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newDob).toBeInTheDocument();
            });
          });

          it('should edit ssn9 and dob correctly', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.ssn9]: '123456789',
            });
            withEdit(entityFixture.id, {
              [IdDI.ssn9]: '123456780',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['SSN (Full)']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Identity data',
            });

            const ssn4 = getInputByRow({
              name: 'SSN (Full)',
              container,
            });
            await userEvent.clear(ssn4);
            await waitFor(() => {
              expect(ssn4).toHaveValue('');
            });
            await userEvent.type(ssn4, '123456780');
            await waitFor(() => {
              expect(ssn4).toHaveValue('123456780');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newSsn = getTextByRow({
                name: 'SSN (Full)',
                value: '123-45-6780',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newSsn).toBeInTheDocument();
            });
          });

          it('should require fields', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.ssn4]: '6789',
              [IdDI.dob]: '1967-09-29',
            });
            withEdit(entityFixture.id, {
              [IdDI.ssn4]: '',
              [IdDI.dob]: '',
            });
            await renderDetailsAndWaitData();
            await decryptFields(['SSN (Last 4)', 'Date of birth']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Identity data',
            });

            const ssn4 = getInputByRow({
              name: 'SSN (Last 4)',
              container,
            });
            await userEvent.clear(ssn4);
            await waitFor(() => {
              expect(ssn4).toHaveValue('');
            });
            const dob = getInputByRow({
              name: 'Date of birth',
              container,
            });
            await userEvent.clear(dob);
            await waitFor(() => {
              expect(dob).toHaveValue('');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              const newSsn = getTextByRow({
                name: 'SSN (Last 4)',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newSsn).toBeInTheDocument();
            });
            await waitFor(() => {
              const newDob = getTextByRow({
                name: 'Date of birth',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newDob).toBeInTheDocument();
            });

            await userEvent.type(ssn4, '1');
            await waitFor(() => {
              expect(ssn4).toHaveValue('1');
            });
            await userEvent.type(dob, '1800-11-11');
            await waitFor(() => {
              expect(dob).toHaveValue('1800-11-11');
            });

            await userEvent.click(saveButton);
            await waitFor(() => {
              const newSsn = getTextByRow({
                name: 'SSN (Last 4)',
                value: 'Cannot be invalid',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newSsn).toBeInTheDocument();
            });
            await waitFor(() => {
              const newDob = getTextByRow({
                name: 'Date of birth',
                value: 'Cannot be before than 1900',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newDob).toBeInTheDocument();
            });

            await userEvent.clear(dob);
            await waitFor(() => {
              expect(dob).toHaveValue('');
            });
            await userEvent.type(dob, '3000-11-11');
            await waitFor(() => {
              expect(dob).toHaveValue('3000-11-11');
            });

            await userEvent.click(saveButton);
            await waitFor(() => {
              const newDob = getTextByRow({
                name: 'Date of birth',
                value: 'Cannot be in the future',
                container: screen.getByRole('group', {
                  name: 'Identity data',
                }),
              });
              expect(newDob).toBeInTheDocument();
            });
          });
        });
      });

      describe('US legal status section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Legal status in the U.S.',
          });

          const status = getTextByRow({
            name: 'Legal status',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(status).toBeInTheDocument();

          const nationality = getTextByRow({
            name: 'Country of birth',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(nationality).toBeInTheDocument();

          const citizenship = getTextByRow({
            name: 'Citizenship',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(citizenship).toBeInTheDocument();

          const visaType = getTextByRow({
            name: 'Visa type',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(visaType).toBeInTheDocument();

          const visaExpiration = getTextByRow({
            name: 'Visa expiration date',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(visaExpiration).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.visa,
              [IdDI.nationality]: 'US',
              [IdDI.citizenships]: ['CA', 'HK'],
              [IdDI.visaKind]: VisaKind.e1,
              [IdDI.visaExpirationDate]: '2026-11-11',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields([
              'Legal status',
              'Country of birth',
              'Citizenship',
              'Visa type',
              'Visa expiration date',
            ]);
            const container = screen.getByRole('group', {
              name: 'Legal status in the U.S.',
            });

            await waitFor(() => {
              const status = getTextByRow({
                name: 'Legal status',
                value: 'Visa',
                container,
              });
              expect(status).toBeInTheDocument();
            });

            await waitFor(() => {
              const nationality = getTextByRow({
                name: 'Country of birth',
                value: 'United States of America',
                container,
              });
              expect(nationality).toBeInTheDocument();
            });

            await waitFor(() => {
              const citizenship = getTextByRow({
                name: 'Citizenship',
                value: 'Canada, Hong Kong',
                container,
              });
              expect(citizenship).toBeInTheDocument();
            });

            await waitFor(() => {
              const visaType = getTextByRow({
                name: 'Visa type',
                value: 'E-1',
                container,
              });
              expect(visaType).toBeInTheDocument();
            });

            await waitFor(() => {
              const visaExpiration = getTextByRow({
                name: 'Visa expiration date',
                value: '2026-11-11',
                container,
              });
              expect(visaExpiration).toBeInTheDocument();
            });
          });
        });

        describe('when clicking on the edit button', () => {
          it('should prefill input fields with current data', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.visa,
              [IdDI.nationality]: 'US',
              [IdDI.citizenships]: ['CA', 'HK'],
              [IdDI.visaKind]: VisaKind.e1,
              [IdDI.visaExpirationDate]: '2026-11-11',
            });
            await renderDetailsAndWaitData();
            await decryptFields([
              'Legal status',
              'Country of birth',
              'Citizenship',
              'Visa type',
              'Visa expiration date',
            ]);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Legal status in the U.S.',
            });

            await waitFor(() => {
              const status = getSelectOptionByRow({
                rowName: 'Legal status',
                optionName: 'Visa',
                container,
              });
              expect(status.selected).toBe(true);
            });

            await waitFor(() => {
              const nationality = getSelectOptionByRow({
                rowName: 'Country of birth',
                optionName: 'United States of America',
                container,
              });
              expect(nationality.selected).toBe(true);
            });

            await waitFor(() => {
              const citizenship = getInputByRow({
                name: 'Citizenship',
                container,
              });
              expect(citizenship).toHaveValue('CA, HK');
            });

            await waitFor(() => {
              const visaType = getSelectOptionByRow({
                rowName: 'Visa type',
                optionName: 'E-1',
                container,
              });
              expect(visaType.selected).toBe(true);
            });

            await waitFor(() => {
              const visaExpiration = getInputByRow({
                name: 'Visa expiration date',
                container,
              });
              expect(visaExpiration).toHaveValue('2026-11-11');
            });
          });

          it('should edit to be citizen and validate correctly', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.visa,
              [IdDI.nationality]: 'CA',
              [IdDI.citizenships]: ['CA'],
              [IdDI.visaKind]: VisaKind.h1b,
              [IdDI.visaExpirationDate]: '2036-11-11',
            });
            withEdit(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.citizen,
              [IdDI.nationality]: 'US',
              [IdDI.citizenships]: undefined,
              [IdDI.visaKind]: undefined,
              [IdDI.visaExpirationDate]: undefined,
            });
            await renderDetailsAndWaitData();
            await decryptFields([
              'Legal status',
              'Country of birth',
              'Citizenship',
              'Visa type',
              'Visa expiration date',
            ]);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Legal status in the U.S.',
            });

            const status = within(container).getByRole('combobox', {
              name: 'Legal status',
            });
            const citizen = within(status).getByRole('option', {
              name: 'Citizen',
            });
            await userEvent.selectOptions(status, citizen);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Legal status',
                  optionName: 'Citizen',
                  container,
                }).selected,
              ).toBe(true);
            });

            const nationality = within(container).getByRole('combobox', {
              name: 'Country of birth',
            });
            const option = within(nationality).getByRole('option', {
              name: 'United States of America',
            });
            await userEvent.selectOptions(nationality, option);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Country of birth',
                  optionName: 'United States of America',
                  container,
                }).selected,
              ).toBe(true);
            });

            // Failed save
            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              const citizenshipError = getTextByRow({
                name: 'Citizenship',
                value: 'Please leave blank',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(citizenshipError).toBeInTheDocument();
            });
            await waitFor(() => {
              const visaKindError = getTextByRow({
                name: 'Visa type',
                value: 'Please leave blank',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(visaKindError).toBeInTheDocument();
            });
            await waitFor(() => {
              const expirationError = getTextByRow({
                name: 'Visa expiration date',
                value: 'Please leave blank',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(expirationError).toBeInTheDocument();
            });

            // Fix errors
            const citizenships = getInputByRow({
              name: 'Citizenship',
              container,
            });
            await userEvent.clear(citizenships);
            await waitFor(() => {
              expect(citizenships).toHaveValue('');
            });

            const visaKind = within(container).getByRole('combobox', {
              name: 'Visa type',
            });
            const emptyKind = within(visaKind).getByRole('option', {
              name: 'Select',
            });
            await userEvent.selectOptions(visaKind, emptyKind);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Visa type',
                  optionName: 'Select',
                  container,
                }).selected,
              ).toBe(true);
            });

            const visaExpiration = getInputByRow({
              name: 'Visa expiration date',
              container,
            });
            await userEvent.clear(visaExpiration);
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('');
            });

            // Successful save
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });
            await waitFor(() => {
              const newStatus = getTextByRow({
                name: 'Legal status',
                value: 'Citizen',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newStatus).toBeInTheDocument();
            });
            await waitFor(() => {
              const newNationality = getTextByRow({
                name: 'Country of birth',
                value: 'United States of America',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newNationality).toBeInTheDocument();
            });
            await waitFor(() => {
              const newCitizenship = getTextByRow({
                name: 'Citizenship',
                value: '-',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newCitizenship).toBeInTheDocument();
            });
          });

          it('should edit to be permanent resident and validate correctly', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.citizen,
              [IdDI.nationality]: 'CA',
              [IdDI.citizenships]: [],
              [IdDI.visaKind]: 'undefined',
              [IdDI.visaExpirationDate]: '',
            });
            withEdit(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.permanentResident,
              [IdDI.citizenships]: ['FR'],
            });
            await renderDetailsAndWaitData();
            await decryptFields(['Legal status', 'Country of birth']);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Legal status in the U.S.',
            });

            const status = within(container).getByRole('combobox', {
              name: 'Legal status',
            });
            const permanentRes = within(status).getByRole('option', {
              name: 'Green Card/permanent resident',
            });
            await userEvent.selectOptions(status, permanentRes);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Legal status',
                  optionName: 'Green Card/permanent resident',
                  container,
                }).selected,
              ).toBe(true);
            });

            const visaKind = within(container).getByRole('combobox', {
              name: 'Visa type',
            });
            const e1 = within(visaKind).getByRole('option', {
              name: 'E-1',
            });
            await userEvent.selectOptions(visaKind, e1);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Visa type',
                  optionName: 'E-1',
                  container,
                }).selected,
              ).toBe(true);
            });

            const visaExpiration = getInputByRow({
              name: 'Visa expiration date',
              container,
            });
            await userEvent.type(visaExpiration, '2026-11-11');
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('2026-11-11');
            });

            // Failed save
            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              const citizenshipError = getTextByRow({
                name: 'Citizenship',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(citizenshipError).toBeInTheDocument();
            });
            await waitFor(() => {
              const visaKindError = getTextByRow({
                name: 'Visa type',
                value: 'Please leave blank',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(visaKindError).toBeInTheDocument();
            });
            await waitFor(() => {
              const expirationError = getTextByRow({
                name: 'Visa expiration date',
                value: 'Please leave blank',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(expirationError).toBeInTheDocument();
            });

            // Fix errors
            const citizenships = getInputByRow({
              name: 'Citizenship',
              container,
            });
            await userEvent.type(citizenships, 'FR');
            await waitFor(() => {
              expect(citizenships).toHaveValue('FR');
            });

            const emptyKind = within(visaKind).getByRole('option', {
              name: 'Select',
            });
            await userEvent.selectOptions(visaKind, emptyKind);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Visa type',
                  optionName: 'Select',
                  container,
                }).selected,
              ).toBe(true);
            });

            await userEvent.clear(visaExpiration);
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('');
            });

            // Successful save
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });
            await waitFor(() => {
              const newStatus = getTextByRow({
                name: 'Legal status',
                value: 'Green Card/permanent resident',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newStatus).toBeInTheDocument();
            });
            await waitFor(() => {
              const sameNationality = getTextByRow({
                name: 'Country of birth',
                value: 'Canada',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(sameNationality).toBeInTheDocument();
            });
            await waitFor(() => {
              const newCitizenship = getTextByRow({
                name: 'Citizenship',
                value: 'France',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newCitizenship).toBeInTheDocument();
            });
          });

          it('should edit to be visa and validate correctly', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.permanentResident,
              [IdDI.nationality]: 'CA',
              [IdDI.citizenships]: ['AL', 'AD'],
              [IdDI.visaKind]: 'undefined',
              [IdDI.visaExpirationDate]: '',
            });
            withEdit(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.permanentResident,
              [IdDI.visaKind]: VisaKind.other,
              [IdDI.visaExpirationDate]: '2036-11-11',
            });
            await renderDetailsAndWaitData();
            await decryptFields([
              'Legal status',
              'Country of birth',
              'Citizenship',
              'Visa type',
              'Visa expiration date',
            ]);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Legal status in the U.S.',
            });

            const status = within(container).getByRole('combobox', {
              name: 'Legal status',
            });
            const permanentRes = within(status).getByRole('option', {
              name: 'Visa',
            });
            await userEvent.selectOptions(status, permanentRes);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Legal status',
                  optionName: 'Visa',
                  container,
                }).selected,
              ).toBe(true);
            });

            const visaExpiration = getInputByRow({
              name: 'Visa expiration date',
              container,
            });
            await userEvent.type(visaExpiration, '1836-11-11');
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('1836-11-11');
            });

            // Failed save
            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              const visaKindError = getTextByRow({
                name: 'Visa type',
                value: 'Cannot be empty',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(visaKindError).toBeInTheDocument();
            });
            await waitFor(() => {
              const expirationError = getTextByRow({
                name: 'Visa expiration date',
                value: 'Cannot be invalid date',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(expirationError).toBeInTheDocument();
            });

            // Fix errors
            const visaKind = within(container).getByRole('combobox', {
              name: 'Visa type',
            });
            const other = within(visaKind).getByRole('option', {
              name: 'Other',
            });
            await userEvent.selectOptions(visaKind, other);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Visa type',
                  optionName: 'Other',
                  container,
                }).selected,
              ).toBe(true);
            });

            await userEvent.clear(visaExpiration);
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('');
            });
            await userEvent.type(visaExpiration, '2036-11-11');
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('2036-11-11');
            });

            // Successful save
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });
            await waitFor(() => {
              const newStatus = getTextByRow({
                name: 'Legal status',
                value: 'Visa',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newStatus).toBeInTheDocument();
            });
            await waitFor(() => {
              const sameCitizenships = getTextByRow({
                name: 'Citizenship',
                value: 'Albania, Andorra',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(sameCitizenships).toBeInTheDocument();
            });
            await waitFor(() => {
              const newVisaKind = getTextByRow({
                name: 'Visa type',
                value: 'Other',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newVisaKind).toBeInTheDocument();
            });
            await waitFor(() => {
              const newExpiration = getTextByRow({
                name: 'Visa expiration date',
                value: '2036-11-11',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newExpiration).toBeInTheDocument();
            });
          });

          it('should be able to delete all fields', async () => {
            withDecrypt(entityFixture.id, {
              [IdDI.usLegalStatus]: UsLegalStatus.visa,
              [IdDI.nationality]: 'CA',
              [IdDI.citizenships]: ['CA'],
              [IdDI.visaKind]: VisaKind.h1b,
              [IdDI.visaExpirationDate]: '2036-11-11',
            });
            withEdit(entityFixture.id, {
              [IdDI.usLegalStatus]: undefined,
              [IdDI.nationality]: undefined,
              [IdDI.citizenships]: undefined,
              [IdDI.visaKind]: undefined,
              [IdDI.visaExpirationDate]: undefined,
            });
            await renderDetailsAndWaitData();
            await decryptFields([
              'Legal status',
              'Country of birth',
              'Citizenship',
              'Visa type',
              'Visa expiration date',
            ]);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Legal status in the U.S.',
            });

            const status = within(container).getByRole('combobox', {
              name: 'Legal status',
            });
            const emptyStatus = within(status).getByRole('option', {
              name: 'Select',
            });
            await userEvent.selectOptions(status, emptyStatus);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Legal status',
                  optionName: 'Select',
                  container,
                }).selected,
              ).toBe(true);
            });

            const nationality = within(container).getByRole('combobox', {
              name: 'Country of birth',
            });
            const emptyNationality = within(nationality).getByRole('option', {
              name: 'Select',
            });
            await userEvent.selectOptions(nationality, emptyNationality);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Country of birth',
                  optionName: 'Select',
                  container,
                }).selected,
              ).toBe(true);
            });

            const citizenships = getInputByRow({
              name: 'Citizenship',
              container,
            });
            await userEvent.clear(citizenships);
            await waitFor(() => {
              expect(citizenships).toHaveValue('');
            });

            const visaKind = within(container).getByRole('combobox', {
              name: 'Visa type',
            });
            const emptyKind = within(visaKind).getByRole('option', {
              name: 'Select',
            });
            await userEvent.selectOptions(visaKind, emptyKind);
            await waitFor(() => {
              expect(
                getSelectOptionByRow({
                  rowName: 'Visa type',
                  optionName: 'Select',
                  container,
                }).selected,
              ).toBe(true);
            });

            const visaExpiration = getInputByRow({
              name: 'Visa expiration date',
              container,
            });
            await userEvent.clear(visaExpiration);
            await waitFor(() => {
              expect(visaExpiration).toHaveValue('');
            });

            const saveButton = screen.getByRole('button', { name: 'Save' });
            await userEvent.click(saveButton);
            await waitFor(() => {
              expect(saveButton).not.toBeInTheDocument();
            });

            await waitFor(() => {
              const newStatus = getTextByRow({
                name: 'Legal status',
                value: '-',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newStatus).toBeInTheDocument();
            });
            await waitFor(() => {
              const newNationality = getTextByRow({
                name: 'Country of birth',
                value: '-',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newNationality).toBeInTheDocument();
            });
            await waitFor(() => {
              const newCitizenships = getTextByRow({
                name: 'Citizenship',
                value: '-',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newCitizenships).toBeInTheDocument();
            });
            await waitFor(() => {
              const newVisaKind = getTextByRow({
                name: 'Visa type',
                value: '-',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newVisaKind).toBeInTheDocument();
            });
            await waitFor(() => {
              const newExpiration = getTextByRow({
                name: 'Visa expiration date',
                value: '-',
                container: screen.getByRole('group', {
                  name: 'Legal status in the U.S.',
                }),
              });
              expect(newExpiration).toBeInTheDocument();
            });
          });
        });
      });

      describe('investor profile data section', () => {
        it('should display the encrypted data', async () => {
          await renderDetailsAndWaitData();
          const container = screen.getByRole('group', {
            name: 'Investor profile data',
          });

          const occupation = getTextByRow({
            name: 'Occupation',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(occupation).toBeInTheDocument();

          const employmentStatus = getTextByRow({
            name: 'Employment status',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(employmentStatus).toBeInTheDocument();

          const annualIncome = getTextByRow({
            name: 'Annual income',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(annualIncome).toBeInTheDocument();

          const netWorth = getTextByRow({
            name: 'Net worth',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(netWorth).toBeInTheDocument();

          const investmentGoals = getTextByRow({
            name: 'Investment goals',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(investmentGoals).toBeInTheDocument();

          const riskTolerance = getTextByRow({
            name: 'Risk tolerance',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(riskTolerance).toBeInTheDocument();

          const declarations = getTextByRow({
            name: 'Declaration(s)',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(declarations).toBeInTheDocument();

          const finra = getTextByRow({
            name: 'Finra compliance letter',
            value: ENCRIPTED_TEXT,
            container,
          });
          expect(finra).toBeInTheDocument();
        });

        describe('when clicking on the decrypt button', () => {
          beforeEach(() => {
            withDecrypt(entityFixture.id, {
              [InvestorProfileDI.occupation]: 'Engineer',
              [InvestorProfileDI.annualIncome]: 'gt500k_le1200k',
              [InvestorProfileDI.riskTolerance]: 'moderate',
              [InvestorProfileDI.netWorth]: 'le50k',
              [InvestorProfileDI.investmentGoals]: '["growth"]',
              [InvestorProfileDI.declarations]: '["affiliated_with_us_broker"]',
              [DocumentDI.finraComplianceLetter]: 'base64',
            });
          });

          it('should allow to decrypt the data', async () => {
            await renderDetailsAndWaitData();
            await decryptFields([
              'Occupation',
              'Annual income',
              'Net worth',
              'Investment goals',
              'Risk tolerance',
              'Declaration(s)',
            ]);
            const container = screen.getByRole('group', {
              name: 'Investor profile data',
            });

            await waitFor(() => {
              const occupation = getTextByRow({
                name: 'Occupation',
                value: 'Engineer',
                container,
              });
              expect(occupation).toBeInTheDocument();
            });

            await waitFor(() => {
              const annualIncome = getTextByRow({
                name: 'Annual income',
                value: '$500,001 - $1,200,000',
                container,
              });
              expect(annualIncome).toBeInTheDocument();
            });

            await waitFor(() => {
              const netWorth = getTextByRow({
                name: 'Net worth',
                value: 'Under $50,000',
                container,
              });
              expect(netWorth).toBeInTheDocument();
            });

            await waitFor(() => {
              const investmentGoals = getTextByRow({
                name: 'Investment goals',
                value: 'Growth',
                container,
              });
              expect(investmentGoals).toBeInTheDocument();
            });

            await waitFor(() => {
              const riskTolerance = getTextByRow({
                name: 'Risk tolerance',
                value: 'Moderate',
                container,
              });
              expect(riskTolerance).toBeInTheDocument();
            });

            await waitFor(() => {
              const declarations = getTextByRow({
                name: 'Declaration(s)',
                value: 'Affiliated or work with a us registered broker-dealer or finra',
                container,
              });
              expect(declarations).toBeInTheDocument();
            });

            await waitFor(() => {
              const finra = getTextByRow({
                name: 'Finra compliance letter',
                value: 'Download',
                container,
              });
              expect(finra).toBeInTheDocument();
            });

            const finraDownload = within(container).getByRole('button', {
              name: 'Download',
            });
            await userEvent.click(finraDownload);
            expect(fileSaverMock).toHaveBeenCalled();
          });
        });

        describe('when clicking on the edit button', () => {
          it('should show that the fields are uneditable', async () => {
            withDecrypt(entityFixture.id, {
              [InvestorProfileDI.occupation]: 'Engineer',
              [InvestorProfileDI.annualIncome]: 'gt500k_le1200k',
              [InvestorProfileDI.riskTolerance]: 'moderate',
              [InvestorProfileDI.netWorth]: 'le50k',
              [InvestorProfileDI.investmentGoals]: '["growth"]',
              [InvestorProfileDI.declarations]: '["affiliated_with_us_broker"]',
              [DocumentDI.finraComplianceLetter]: 'base64',
            });
            await renderDetailsAndWaitData();
            await decryptFields([
              'Occupation',
              'Annual income',
              'Net worth',
              'Investment goals',
              'Risk tolerance',
              'Declaration(s)',
            ]);
            await openEditView();
            const container = screen.getByRole('group', {
              name: 'Investor profile data',
            });

            const occupation = getTextByRow({
              name: 'Occupation',
              value: "Can't be edited",
              container,
            });
            expect(occupation).toBeInTheDocument();

            const employmentStatus = getTextByRow({
              name: 'Employment status',
              value: "Can't be edited",
              container,
            });
            expect(employmentStatus).toBeInTheDocument();

            const annualIncome = getTextByRow({
              name: 'Annual income',
              value: "Can't be edited",
              container,
            });
            expect(annualIncome).toBeInTheDocument();

            const netWorth = getTextByRow({
              name: 'Net worth',
              value: "Can't be edited",
              container,
            });
            expect(netWorth).toBeInTheDocument();

            const investmentGoals = getTextByRow({
              name: 'Investment goals',
              value: "Can't be edited",
              container,
            });
            expect(investmentGoals).toBeInTheDocument();

            const riskTolerance = getTextByRow({
              name: 'Risk tolerance',
              value: "Can't be edited",
              container,
            });
            expect(riskTolerance).toBeInTheDocument();

            const declarations = getTextByRow({
              name: 'Declaration(s)',
              value: "Can't be edited",
              container,
            });
            expect(declarations).toBeInTheDocument();

            const finra = getTextByRow({
              name: 'Finra compliance letter',
              value: "Can't be edited",
              container,
            });
            expect(finra).toBeInTheDocument();
          });
        });
      });
    });

    describe('risk signals', () => {
      it('should show the results', async () => {
        await renderDetailsAndWaitData();
        const container = screen.getByRole('region', {
          name: 'Risk signals',
        });

        await waitFor(() => {
          const noResults = within(container).getByText('No risk signals found');
          expect(noResults).toBeInTheDocument();
        });
      });
    });

    describe('device insights', () => {
      it('should show the user agent', async () => {
        await renderDetailsAndWaitData();
        const container = screen.getByRole('region', {
          name: 'Device insights',
        });

        const agent = within(container).getByText('Apple Macintosh, Mac OS 10.15.7');

        expect(agent).toBeInTheDocument();
      });

      it('should show the ip address', async () => {
        await renderDetailsAndWaitData();
        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const ip = getTextByRow({
          name: 'IP address',
          value: '73.222.157.30',
          container,
        });

        expect(ip).toBeInTheDocument();
      });

      it('should show the biometrics', async () => {
        await renderDetailsAndWaitData();
        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const ip = getTextByRow({
          name: 'Biometrics',
          value: 'Verified',
          container,
        });

        expect(ip).toBeInTheDocument();
      });

      it('should show the region', async () => {
        await renderDetailsAndWaitData();
        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const region = getTextByRow({
          name: 'Region',
          value: 'San Francisco, CA',
          container,
        });

        expect(region).toBeInTheDocument();
      });

      it('should show the country', async () => {
        await renderDetailsAndWaitData();
        const container = screen.getByRole('region', {
          name: 'Device insights',
        });
        const country = getTextByRow({
          name: 'Country',
          value: 'United States',
          container,
        });

        expect(country).toBeInTheDocument();
      });
    });
  });

  describe('when the request to fetch the users fails', () => {
    beforeEach(() => {
      withEntityError();
    });

    it('should show an error message', async () => {
      renderDetails();
      await waitFor(() => {
        const feedback = screen.getByText('Something went wrong');
        expect(feedback).toBeInTheDocument();
      });
    });
  });
});
