import type { Icon } from '@onefootprint/icons';
import { IcoDatabase24, IcoStore24, IcoUser24 } from '@onefootprint/icons';
import { Dialog, type DialogSize, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PRIVATE_ROUTE } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

import Button from './components/button';
import useCleanUpUserForm from './hooks/clean-up-user-form';
import useCreateSandboxTenantForm from './hooks/create-sandbox-tenant-form';

export type ToolFormProps = {
  formId: string;
  onClose: () => void;
};

export type DialogComponentOutput = {
  component: React.ReactNode;
  isPending: boolean;
};

type Tool = {
  title: string;
  subtitle: string;
  // When specified, selecting this tool opens a dialog with the provided component
  useDialogComponent?: (props: ToolFormProps) => DialogComponentOutput;
  // When specified, selecting this tool performs the provided operation
  onClick?: () => void;
  icon: Icon;
  size?: DialogSize;
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
      useDialogComponent: useCleanUpUserForm,
    },
    {
      title: 'Create sandbox tenant',
      subtitle: `Before a sales demo, pre-create a tenant for the target customer's company`,
      icon: IcoStore24,
      useDialogComponent: useCreateSandboxTenantForm,
    },
  ];

  const handleSelectTool = (tool: Tool) => () => {
    if (tool.useDialogComponent) {
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
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-heading-2 text-primary">{t('title')}</h2>
        <h3 className="text-body-2 text-secondary">{t('subtitle')}</h3>
      </div>
      <div className="flex flex-wrap gap-4 w-full">
        {tools.map(tool => (
          <Button
            key={tool.title}
            onClick={handleSelectTool(tool)}
            title={tool.title}
            subtitle={tool.subtitle}
            icon={tool.icon}
          />
        ))}
      </div>
      {selectedTool && <SelectedToolDialog selectedTool={selectedTool} handleDialogClose={handleDialogClose} />}
    </>
  );
};

const SelectedToolDialog = ({
  selectedTool,
  handleDialogClose,
}: {
  selectedTool: Tool;
  handleDialogClose: () => void;
}) => {
  if (!selectedTool.useDialogComponent) {
    return null;
  }
  const { component, isPending } = selectedTool.useDialogComponent({
    formId: 'tool-form',
    onClose: handleDialogClose,
  });

  return (
    <Dialog
      size={selectedTool.size || 'compact'}
      title={selectedTool?.title}
      onClose={handleDialogClose}
      open={!!selectedTool}
      primaryButton={{
        form: 'tool-form',
        label: 'Submit',
        type: 'submit',
        loading: isPending,
      }}
    >
      {component}
    </Dialog>
  );
};

export default Tenants;
