import { Badge } from '@onefootprint/ui';
import { statusVariant } from '../../../../../../constants';
import type { FormattedRegistration } from '../../../../../../onboarding-business-insight.types';
import useRegistrationStatusText from '../../../../hooks/use-registration-status-text';

type RowProps = {
  filing: FormattedRegistration;
};

const Row = ({ filing: { state, registrationDate, status } }: RowProps) => {
  const t = useRegistrationStatusText();

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
