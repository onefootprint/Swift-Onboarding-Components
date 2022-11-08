import { IcoCar16, IcoIdCard16, IcoPassport16 } from '@onefootprint/icons';
import { IdDocUploadedEvent, IdScanDocType } from '@onefootprint/types';
import React from 'react';

const IconByIdDocType: Record<IdScanDocType, JSX.Element> = {
  [IdScanDocType.idCard]: <IcoIdCard16 />,
  [IdScanDocType.driversLicense]: <IcoCar16 />,
  [IdScanDocType.passport]: <IcoPassport16 />,
};

type IdDocUploadedEventIconProps = {
  data: IdDocUploadedEvent;
};

const IdDocUploadedEventIcon = ({ data }: IdDocUploadedEventIconProps) =>
  IconByIdDocType[data.idDocKind] ?? <IcoIdCard16 />;

export default IdDocUploadedEventIcon;
