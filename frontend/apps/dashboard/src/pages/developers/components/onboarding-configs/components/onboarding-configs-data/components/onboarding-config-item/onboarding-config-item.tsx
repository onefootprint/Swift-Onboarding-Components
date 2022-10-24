import { useToggle } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import React from 'react';

import Table from '../../../table';
import AccessPermissionScopeRow from './components/access-permission-scope-row';
import EditDialog from './components/edit-dialog';
import IdDocRow from './components/id-doc-row';
import NameRow from './components/name-row';
import OnboardingPublishableKeyRow from './components/onboarding-publishable-key-row';
import RequiredDataToBeCollectedRow from './components/required-data-to-be-collected-row';
import StatusRow from './components/status-row';
import useUpdateOnboardingConfig from './hooks/use-update-onboarding-config';

export type OnboardingConfigItemProps = {
  data: OnboardingConfig;
};

const OnboardingConfigItem = ({ data }: OnboardingConfigItemProps) => {
  const [isEditDialogOpen, openEditDialog, closeEditDialog] = useToggle(false);
  const updateMutation = useUpdateOnboardingConfig();

  const updateName = (formData: { name: string }) => {
    updateMutation.mutate({ id: data.id, name: formData.name });
  };

  return (
    <>
      <Table data-testid={`onboarding-config-${data.id}`}>
        <colgroup>
          <col span={1} style={{ width: '35%' }} />
          <col span={1} style={{ width: '40%' }} />
          <col span={1} style={{ width: '25%' }} />
        </colgroup>
        <thead>
          <NameRow data={data} onEdit={openEditDialog} />
        </thead>
        <tbody>
          <RequiredDataToBeCollectedRow data={data} />
          <IdDocRow data={data} />
          <AccessPermissionScopeRow data={data} />
          <OnboardingPublishableKeyRow data={data} />
          <StatusRow data={data} />
        </tbody>
      </Table>
      <EditDialog
        defaultValues={{ name: data.name }}
        onClose={closeEditDialog}
        onSubmit={updateName}
        open={isEditDialogOpen}
      />
    </>
  );
};

export default OnboardingConfigItem;
