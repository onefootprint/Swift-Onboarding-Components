import type { Icon } from '@onefootprint/icons';
import { IcoDatabase24, IcoStore24, IcoUser24 } from '@onefootprint/icons';
import { Dialog, Stack, Typography, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PRIVATE_ROUTE } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

import Button from './components/button';
import CleanUpUserForm from './components/clean-up-user-form';
import CreateSandboxTenantForm from './components/create-sandbox-tenant-form';

type Tool = {
  title: string;
  subtitle: string;
  // When specified, selecting this tool opens a dialog with the provided component
  dialogComponent?: React.ReactNode;
  // When specified, selecting this tool performs the provided operation
  onClick?: () => void;
  icon: Icon;
};

const Tenants = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.toolbox' });
  const {
    data: { auth, user },
  } = useSession();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const toast = useToast();
  const router = useRouter();

  if (!user?.isFirmEmployee) {
    // Quick guard against non-firm-employees navigating to this URL
    router.push(DEFAULT_PRIVATE_ROUTE);
  }

  const handleDialogClose = () => {
    setSelectedTool(null);
  };

  const tools: Tool[] = [
    {
      title: 'Copy auth token',
      subtitle: 'Copy your dashboard auth token to the clipboard',
      icon: IcoUser24,
      onClick: () => {
        navigator.clipboard.writeText(auth || '');
        toast.show({
          title: 'Success!',
          description: 'Copied auth token to clipboard',
        });
      },
    },
    {
      title: 'Clean up user',
      subtitle: 'Delete a vault belonging to an employee and all its data',
      icon: IcoDatabase24,
      dialogComponent: (
        <CleanUpUserForm formId="tool-form" onClose={handleDialogClose} />
      ),
    },
    {
      title: 'Create sandbox tenant',
      subtitle: `Before a sales demo, pre-create a tenant for the target customer's company`,
      icon: IcoStore24,
      dialogComponent: (
        <CreateSandboxTenantForm
          formId="tool-form"
          onClose={handleDialogClose}
        />
      ),
    },
  ];

  const handleSelectTool = (tool: Tool) => () => {
    if (tool.dialogComponent) {
      setSelectedTool(tool);
    } else if (tool.onClick) {
      tool.onClick();
    }
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Stack gap={2} marginBottom={7} direction="column">
        <Typography variant="heading-2">{t('title')}</Typography>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={5} width="100%">
        {tools.map(tool => (
          <Button
            key={tool.title}
            onClick={handleSelectTool(tool)}
            title={tool.title}
            subtitle={tool.subtitle}
            icon={tool.icon}
          />
        ))}
      </Stack>
      {selectedTool && (
        <Dialog
          size="compact"
          title={selectedTool?.title}
          onClose={handleDialogClose}
          open={!!selectedTool}
          primaryButton={{
            form: 'tool-form',
            label: t('submit'),
            type: 'submit',
          }}
        >
          {selectedTool?.dialogComponent}
        </Dialog>
      )}
    </>
  );
};

export default Tenants;
