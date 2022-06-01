import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'src/components/modal';
import { Checkbox, Grid, Typography } from 'ui';

import FormSection from './components/form-section';

type DecryptDataDialogProps = {
  open: boolean;
  onClose: () => void;
};

// TODO: Adjust
type FormData = {
  all: boolean;
  name: boolean;
  email: boolean;
  phoneNumber: boolean;
  ssn: boolean;
  dob: boolean;
  country: boolean;
  addressLine1: boolean;
  addressLine2: boolean;
  city: boolean;
  zip: boolean;
  state: boolean;
};

const DecryptDataDialog = ({ open, onClose }: DecryptDataDialogProps) => {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (formData: FormData) => {
    console.log(formData);
  };

  return open ? (
    <Modal
      size="compact"
      headerText="Decrypt data"
      primaryButtonText="Continue"
      secondaryButtonText="Cancel"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography color="primary" variant="label-2" sx={{ marginBottom: 4 }}>
          What data would you like to decrypt?
        </Typography>
        <Checkbox label="All" {...register('all')} />
        <Grid.Row>
          <Grid.Column col={6}>
            <FormSection title="Basic data">
              <Checkbox label="Name" {...register('name')} />
              <Checkbox label="Email" {...register('email')} />
              <Checkbox label="Phone number" {...register('phoneNumber')} />
            </FormSection>
            <FormSection title="Identity data">
              <Checkbox label="SSN" {...register('ssn')} />
              <Checkbox label="Date of birth" {...register('dob')} />
            </FormSection>
          </Grid.Column>
          <Grid.Column col={6}>
            <FormSection title="Address">
              <Checkbox label="Country" {...register('country')} />
              <Checkbox label="Address line 1" {...register('addressLine1')} />
              <Checkbox label="Address line 2" {...register('addressLine2')} />
              <Checkbox label="City" {...register('city')} />
              <Checkbox label="Zip code" {...register('zip')} />
              <Checkbox label="State" {...register('state')} />
            </FormSection>
          </Grid.Column>
        </Grid.Row>
        <button type="submit">submit</button>
      </form>
    </Modal>
  ) : null;
};

export default DecryptDataDialog;
