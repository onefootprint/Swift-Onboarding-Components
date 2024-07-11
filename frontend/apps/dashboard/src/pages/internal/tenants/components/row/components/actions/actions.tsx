import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Tenant } from '@onefootprint/types';
import { AnimatedLoadingSpinner, Dropdown, useToast } from '@onefootprint/ui';
import React from 'react';
import useGenerateInvoice from './hooks/use-generate-invoice';

type ActionsProps = {
  tenant: Tenant;
};

const Actions = ({ tenant }: ActionsProps) => {
  const generateInvoiceMutation = useGenerateInvoice();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const handleGenerateInvoice = () => {
    generateInvoiceMutation.mutate(tenant.id, {
      onSuccess: () => {
        toast.show({
          title: 'Success!',
          description: 'Invoice successfully generated',
        });
      },
      onError: (error: unknown) => {
        showRequestErrorToast(error);
      },
    });
  };
  const isLoading = generateInvoiceMutation.isLoading;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger aria-label={'Actions'}>
        {isLoading ? <AnimatedLoadingSpinner animationStart /> : <IcoDotsHorizontal24 />}
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        <Dropdown.Item onSelect={handleGenerateInvoice} onClick={event => event.stopPropagation()}>
          Generate invoice
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default Actions;
