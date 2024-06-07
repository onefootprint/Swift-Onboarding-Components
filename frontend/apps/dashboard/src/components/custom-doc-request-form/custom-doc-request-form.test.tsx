import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import type { CustomDI } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import CustomDocRequestForm from '.';

type FormData = {
  customDocNameFormField?: string;
  customDocIdentifierFormField?: CustomDI;
  customDocDescriptionFormField?: string;
};

let submittedData: FormData | undefined;

const CustomDocRequestFormWithFromProvider = () => {
  const methods = useForm<FormData>();
  const handleBeforeSubmit = (data: FormData) => {
    submittedData = data;
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleBeforeSubmit)}>
        <CustomDocRequestForm
          customDocNameFormField="customDocNameFormField"
          customDocIdentifierFormField="customDocIdentifierFormField"
          customDocDescriptionFormField="customDocDescriptionFormField"
        />
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
};

const renderCustomDocRequestForm = () => customRender(<CustomDocRequestFormWithFromProvider />);

describe('CustomDocRequestForm', () => {
  it('should error when there is no document name', async () => {
    renderCustomDocRequestForm();
    const identifierInput = screen.getByLabelText('Identifier');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.type(identifierInput, 'identifier_input');
    await userEvent.type(descriptionInput, 'description input');
    await userEvent.click(submitButton);
    await waitFor(() => {
      const errorMessage = screen.getByText('Please enter a document name');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should error when there is no identifier', async () => {
    renderCustomDocRequestForm();
    const nameInput = screen.getByLabelText('Document name');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.type(nameInput, 'name input');
    await userEvent.type(descriptionInput, 'description input');
    await userEvent.click(submitButton);
    await waitFor(() => {
      const errorMessage = screen.getByText('Please enter a document identifier');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should not error when there is no description', async () => {
    renderCustomDocRequestForm();
    const nameInput = screen.getByLabelText('Document name');
    const identifierInput = screen.getByLabelText('Identifier');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.type(nameInput, 'name input');
    await userEvent.type(identifierInput, 'identifier_input');
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(submittedData).toEqual({
        customDocNameFormField: 'name input',
        customDocIdentifierFormField: 'document.custom.identifier_input',
        customDocDescriptionFormField: '',
      });
    });
  });

  it('should not allow space in the identifier', async () => {
    renderCustomDocRequestForm();
    const nameInput = screen.getByLabelText('Document name');
    const identifierInput = screen.getByLabelText('Identifier');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.type(nameInput, 'name input');
    await userEvent.type(identifierInput, 'identifier input$');
    await userEvent.type(descriptionInput, 'description input');
    await userEvent.click(submitButton);
    await waitFor(() => {
      const errorMessage = screen.getByText('Only letters, numbers, underscores, and hyphens are allowed');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should not allow special character in the identifier except for underscore', async () => {
    renderCustomDocRequestForm();
    const nameInput = screen.getByLabelText('Document name');
    const identifierInput = screen.getByLabelText('Identifier');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.type(nameInput, 'name input');
    await userEvent.type(identifierInput, 'identifier-input$');
    await userEvent.type(descriptionInput, 'description input');
    await userEvent.click(submitButton);
    await waitFor(() => {
      const errorMessage = screen.getByText('Only letters, numbers, underscores, and hyphens are allowed');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it("submits correctly when there's no error", async () => {
    renderCustomDocRequestForm();
    const nameInput = screen.getByLabelText('Document name');
    const identifierInput = screen.getByLabelText('Identifier');
    const descriptionInput = screen.getByLabelText('Description (optional)');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await userEvent.type(nameInput, 'name input');
    await userEvent.type(identifierInput, 'identifier-input');
    await userEvent.type(descriptionInput, 'description input');
    await userEvent.click(submitButton);
    await waitFor(() => {
      expect(submittedData).toEqual({
        customDocNameFormField: 'name input',
        customDocIdentifierFormField: 'document.custom.identifier-input',
        customDocDescriptionFormField: 'description input',
      });
    });
  });
});
