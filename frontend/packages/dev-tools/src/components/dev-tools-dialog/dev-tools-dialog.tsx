import styled, { css } from '@onefootprint/styled';
import { Dialog, Tab, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';

import EnvVariables from './components/env-variables';

enum AvailableTabs {
  envVariables = 'env-variables',
  help = 'help',
}

type DevToolsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const DevToolsDialog = ({ open, onClose }: DevToolsDialogProps) => {
  const [tab, setTab] = useState<AvailableTabs>(AvailableTabs.envVariables);

  return (
    <Dialog
      title="Footprint developer tools"
      onClose={onClose}
      open={open}
      secondaryButton={{
        label: 'Close',
        onClick: onClose,
      }}
      primaryButton={{
        label: 'Save',
        type: 'submit',
        form: 'env-variables-form',
      }}
    >
      <Tabs variant="underlined">
        <Tab
          as="button"
          onClick={() => setTab(AvailableTabs.envVariables)}
          selected={tab === AvailableTabs.envVariables}
        >
          Env variables
        </Tab>
      </Tabs>
      <TabContent>
        {tab === AvailableTabs.envVariables && <EnvVariables />}
      </TabContent>
    </Dialog>
  );
};

const TabContent = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[6]};
  `}
`;

export default DevToolsDialog;
