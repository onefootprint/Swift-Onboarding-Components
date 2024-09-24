import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { Tenant } from '@onefootprint/types';
import { Dropdown, LoadingSpinner, useToast } from '@onefootprint/ui';
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
  const isPending = generateInvoiceMutation.isPending;

  return (
    <Dropdown.Root>
      <Dropdown.Trigger aria-label={'Actions'}>
        {isPending ? <LoadingSpinner /> : <IcoDotsHorizontal24 />}
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end">
          <Dropdown.Item onSelect={handleGenerateInvoice} onClick={event => event.stopPropagation()}>
            Generate invoice
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default Actions;
