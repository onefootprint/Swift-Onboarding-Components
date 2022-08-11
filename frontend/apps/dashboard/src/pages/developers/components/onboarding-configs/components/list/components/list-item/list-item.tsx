import { useToggle, useTranslation } from 'hooks';
import IcoPencil16 from 'icons/ico/ico-pencil-16';
import React from 'react';
import type { OnboardingConfig } from 'src/types/onboarding-config';
import styled, { css } from 'styled-components';
import { Badge, CodeInline, IconButton, LinkButton, Tag, Typography } from 'ui';

import EditDialog from './components/edit-dialog';
import useUpdateOnboardingConfig from './hooks/use-update-onboarding-config';

type ListItemProps = {
  data: OnboardingConfig;
};

const ListItem = ({ data }: ListItemProps) => {
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
              <Typography color="tertiary" variant="body-3">
                {t('required-data.label')}
              </Typography>
            </td>
            <td>
              <TagList data-testid={`must-collect-data-kinds-${data.id}`}>
                {data.mustCollectDataKinds.map(tag => (
                  <Tag key={`must-access-${tag}`}>
                    {allT(`data-kinds.${tag}`)}
                  </Tag>
                ))}
              </TagList>
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('access-data.label')}
              </Typography>
            </td>
            <td>
              <TagList data-testid={`can-access-data-kinds-${data.id}`}>
                {data.canAccessDataKinds.map(tag => (
                  <Tag key={`can-access-${tag}`}>
                    {allT(`data-kinds.${tag}`)}
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
            <td />
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

const Table = styled.table`
  ${({ theme }) => css`
    border-collapse: collapse;
    border-radius: ${theme.borderRadius[2]}px;
    border-style: hidden;
    box-shadow: 0 0 0 1px ${theme.borderColor.tertiary};
    width: 100%;

    thead {
      tr {
        background: ${theme.backgroundColor.secondary};
      }

      th {
        padding: ${theme.spacing[5]}px ${theme.spacing[6]}px;
        vertical-align: middle;

        &:first-child {
          text-align: left;
        }

        &:last-child {
          text-align: right;
        }
      }
    }

    tbody {
      td {
        padding: ${theme.spacing[4]}px ${theme.spacing[6]}px;
      }
    }

    tr {
      border-bottom: 1pt solid ${theme.borderColor.tertiary};
    }
  `}
`;

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

export default ListItem;
