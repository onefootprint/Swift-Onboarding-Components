import type { BacktestedOnboarding } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import Row from '../row';

type TableProps = {
  data: BacktestedOnboarding[];
  isEmpty: boolean;
};

const Table = ({ data, isEmpty }: TableProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.backtesting.affected',
  });
  const router = useRouter();
  const session = useSession();
  const columns = [
    { id: 'fpId', text: t('header.id'), width: '34%' },
    {
      id: 'currentObStatus',
      text: t('header.current-status'),
      width: '22%',
    },
    {
      id: 'originalOutcome',
      text: t('header.historical-outcome'),
      tooltip: {
        text: t('header.historical-tooltip'),
      },
      width: '22%',
    },
    {
      id: 'backtestedOutcome',
      text: t('header.backtested-outcome'),
      tooltip: {
        text: t('header.backtested-tooltip'),
      },
      width: '22%',
    },
  ];

  const handleRowClick = (backtestedRule: BacktestedOnboarding) => {
    const mode = session.isLive ? 'live' : 'sandbox';
    router.push({
      pathname: `/users/${backtestedRule.fpId}`,
      query: { mode },
    });
  };

  return (
    <TableContainer>
      <UITable<BacktestedOnboarding>
        aria-label={t('aria-label')}
        columns={columns}
        emptyStateText={isEmpty ? t('none-total') : t('none-affected')}
        getAriaLabelForRow={backtestedRule => backtestedRule.fpId}
        getKeyForRow={backtestedRule => backtestedRule.fpId}
        onRowClick={handleRowClick}
        items={data}
        renderTr={({ item: onboarding }) => <Row onboarding={onboarding} />}
      />
    </TableContainer>
  );
};

const TableContainer = styled.div`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[3]};

    table {
      border: none;
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;

      th {
        background: ${theme.backgroundColor.primary};
      }

      tbody tr:last-child {
        td:first-child {
          border-bottom-left-radius: 0px;
        }

        td:last-child {
          border-bottom-right-radius: 0px;
        }
      }
    }
  `};
`;

export default Table;
