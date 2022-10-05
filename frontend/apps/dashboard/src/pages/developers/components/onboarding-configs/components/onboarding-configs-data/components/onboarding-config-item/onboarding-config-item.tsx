import { DEMO_BASE_URL } from '@onefootprint/global-constants';
import { useToggle, useTranslation } from '@onefootprint/hooks';
import {
  IcoArrowTopRight16,
  IcoInfo16,
  IcoPencil16,
} from '@onefootprint/icons';
import { OnboardingConfig } from '@onefootprint/types';
import {
  Badge,
  Box,
  CodeInline,
  IconButton,
  LinkButton,
  Tag,
  Tooltip,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Table from '../../../table';
import EditDialog from './components/edit-dialog';
import useUpdateOnboardingConfig from './hooks/use-update-onboarding-config';

export type OnboardingConfigItemProps = {
  data: OnboardingConfig;
};

const OnboardingConfigItem = ({ data }: OnboardingConfigItemProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.list-item',
  );
  const [isEditDialogOpen, openEditDialog, closeEditDialog] = useToggle(false);
  const updateMutation = useUpdateOnboardingConfig();

  const toggleStatus = () => {
    const nextStatus = data.status === 'enabled' ? 'disabled' : 'enabled';
    updateMutation.mutate({ id: data.id, status: nextStatus });
  };

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
          <tr>
            <th>
              <Name>
                <Typography variant="label-2">{data.name}</Typography>
                <IconButton
                  aria-label={t('edit')}
                  iconComponent={IcoPencil16}
                  onClick={openEditDialog}
                />
              </Name>
              <Typography variant="body-4" color="secondary">
                {t('created-at', { date: data.createdAt })}
              </Typography>
            </th>
            <th>&nbsp;</th>
            <th>
              <LinkButton
                onClick={toggleStatus}
                size="tiny"
                variant={data.status === 'enabled' ? 'destructive' : 'default'}
              >
                {data.status === 'enabled'
                  ? t('toggle-status.disable')
                  : t('toggle-status.enable')}
              </LinkButton>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                }}
              >
                <Typography color="tertiary" variant="body-3">
                  {t('required-data.label')}
                </Typography>
                <Tooltip
                  text={t('required-data.tooltip')}
                  placement="bottom-start"
                >
                  <Box sx={{ display: 'flex' }}>
                    <IcoInfo16 />
                  </Box>
                </Tooltip>
              </Box>
            </td>
            <td>
              <TagList data-testid={`must-collect-data-${data.id}`}>
                {data.mustCollectData.map(tag => (
                  <Tag key={`must-access-${tag}`}>
                    {allT(`collected-data-options.${tag}`)}
                  </Tag>
                ))}
              </TagList>
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                }}
              >
                <Typography color="tertiary" variant="body-3">
                  {t('access-data.label')}
                </Typography>
                <Tooltip
                  text={t('access-data.tooltip')}
                  placement="bottom-start"
                >
                  <Box sx={{ display: 'flex' }}>
                    <IcoInfo16 />
                  </Box>
                </Tooltip>
              </Box>
            </td>
            <td>
              <TagList data-testid={`can-access-data-${data.id}`}>
                {data.canAccessData.map(tag => (
                  <Tag key={`can-access-${tag}`}>
                    {allT(`collected-data-options.${tag}`)}
                  </Tag>
                ))}
              </TagList>
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('key.label')}
              </Typography>
            </td>
            <td>
              <CodeInline>{data.key}</CodeInline>
            </td>
            <td>
              {data.isLive ? null : (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <LinkButton
                    href={`${DEMO_BASE_URL}/preview?ob_key=${data.key}`}
                    iconComponent={IcoArrowTopRight16}
                    size="compact"
                    target="_blank"
                  >
                    {t('key.cta')}
                  </LinkButton>
                </Box>
              )}
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('status.label')}
              </Typography>
            </td>
            <td>
              <Badge variant={data.status === 'enabled' ? 'success' : 'error'}>
                {data.status}
              </Badge>
            </td>
            <td />
          </tr>
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

const Name = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
  `}
`;

const TagList = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]}px;
  `}
`;

export default OnboardingConfigItem;
