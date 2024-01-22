import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Dialog, Grid, Stack, Typography, useToast } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { DEFAULT_PRIVATE_ROUTE } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

import CleanUpUserForm from './components/clean-up-user-form';
import CreateSandboxTenantForm from './components/create-sandbox-tenant-form';

type Tool = {
  title: string;
  subtitle: string;
  // When specified, selecting this tool opens a dialog with the provided component
  dialogComponent?: React.ReactNode;
  // When specified, selecting this tool performs the provided operation
  onClick?: () => void;
};

const Tenants = () => {
  const { t } = useTranslation('pages.toolbox');
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
      dialogComponent: (
        <CleanUpUserForm formId="tool-form" onClose={handleDialogClose} />
      ),
    },
    {
      title: 'Create sandbox tenant',
      subtitle: `Before a sales demo, pre-create a tenant for the target customer's company`,
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
      <Container>
        <Stack gap={2} marginBottom={7} direction="column">
          <Typography variant="heading-2">{t('title')}</Typography>
          <Typography variant="body-2" color="secondary">
            {t('subtitle')}
          </Typography>
        </Stack>
        <Grid.Container gap={5} columns={['repeat(3, 1fr)']}>
          {tools.map(tool => (
            <Grid.Item gridArea={tool.title} onClick={handleSelectTool(tool)}>
              <ItemBox>
                <Stack direction="column" gap={7}>
                  <Typography variant="display-3">{tool.title}</Typography>
                  <Typography variant="body-3">{tool.subtitle}</Typography>
                </Stack>
              </ItemBox>
            </Grid.Item>
          ))}
        </Grid.Container>
      </Container>
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

const ItemBox = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    cursor: pointer;
    width: 100%;

    :hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const Container = styled.div`
  max-width: 1600px;
  margin-right: auto;
  margin-left: auto;
`;

export default Tenants;
