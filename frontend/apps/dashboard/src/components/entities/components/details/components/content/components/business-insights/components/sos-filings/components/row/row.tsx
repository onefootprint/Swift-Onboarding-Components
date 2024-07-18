import { SOSFiling } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import React from 'react';
import useFilingStatusText from '../../../../hooks/use-filing-status-text';
import statusVariant from '../../constants';

type RowProps = {
  filing: SOSFiling;
};

const Row = ({ filing }: RowProps) => {
  const t = useFilingStatusText();
  const { state, registrationDate, status } = filing;

  const renderStatus = () => {
    if (status && Object.keys(statusVariant).includes(status)) {
      return <Badge variant={statusVariant[status]}>{t(status)}</Badge>;
    }
    return '-';
  };

  return (
    <>
      <td>{state}</td>
      <td>{registrationDate}</td>
      <td>{renderStatus()}</td>
    </>
  );
};

export default Row;
