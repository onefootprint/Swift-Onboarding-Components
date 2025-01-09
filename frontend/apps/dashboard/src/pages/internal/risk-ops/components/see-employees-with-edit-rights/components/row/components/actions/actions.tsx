import { patchPrivateAccessRequestsByRequestIdMutation } from '@onefootprint/axios/dashboard';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Dropdown, IconButton, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';

type ActionsProps = {
  id: string;
};

const Actions = ({ id }: ActionsProps) => {
  const [open, setOpen] = useState(false);
  const mutation = useMutation(patchPrivateAccessRequestsByRequestIdMutation({ throwOnError: true }));
  const invalidateQueries = useInvalidateQueries();
  const toast = useToast();

  const handleSetOpen = () => {
    setOpen(true);
  };

  const patchPrivateAccessRequestsByRequestId = (id: string, approved: boolean) => {
    mutation.mutate(
      {
        path: {
          requestId: id,
        },
        body: {
          approved,
        },
      },
      {
        onSuccess: () => {
          toast.show({
            title: approved ? 'Edit rights extended' : 'Edit rights revoked',
            description: approved ? 'Edit rights have been extended' : 'Edit rights have been revoked',
          });
          invalidateQueries();
        },
        onError: error => {
          toast.show({
            title: 'Error',
            description: getErrorMessage(error),
          });
          invalidateQueries();
        },
      },
    );
  };

  const handleRevoke = () => {
    setOpen(false);
    patchPrivateAccessRequestsByRequestId(id, false);
  };

  const handleExtend = () => {
    setOpen(false);
    patchPrivateAccessRequestsByRequestId(id, true);
  };

  return (
    <button className="flex justify-end" type="button">
      <Dropdown.Root open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger asChild>
          <IconButton aria-label="Actions" size="compact" onClick={handleSetOpen}>
            <IcoDotsHorizontal24 />
          </IconButton>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content align="end" style={{ zIndex: 999999 }}>
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleExtend}>Extend edit rights</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Divider />
            <Dropdown.Group>
              <Dropdown.Item onSelect={handleRevoke}>Revoke edit rights</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </button>
  );
};

export default Actions;
