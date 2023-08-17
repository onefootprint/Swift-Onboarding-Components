import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { defaultValues, FormData } from '../../../../your-playbook';
import Editing from './editing';

const Form = () => {
  const formMethods = useForm<FormData>({ defaultValues });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing setEditing={() => {}} />
      </form>
    </FormProvider>
  );
};

const renderEditing = () => {
  customRender(<Form />);
};

describe('<Editing />', () => {
  it('should show SSN options when toggling', async () => {
    renderEditing();
    const ssnToggle = screen.getByRole('switch', {
      name: 'Request users to provide their SSN',
    });
    await userEvent.click(ssnToggle);
    expect(screen.getByRole('radio', { name: 'Full' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Last 4 digits' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Allow users without a Social Security Number to proceed with the verification',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('They will need to be manually reviewed by you.'),
    ).toBeInTheDocument();
  });

  it('should show ID doc options when toggling', async () => {
    renderEditing();
    const ssnToggle = screen.getByRole('switch', {
      name: 'Request users to scan an ID document',
    });
    await userEvent.click(ssnToggle);
    expect(
      screen.getByRole('checkbox', {
        name: "Driver's license",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Identity card',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Passport (photo page)',
      }),
    ).toBeInTheDocument();
  });
});
