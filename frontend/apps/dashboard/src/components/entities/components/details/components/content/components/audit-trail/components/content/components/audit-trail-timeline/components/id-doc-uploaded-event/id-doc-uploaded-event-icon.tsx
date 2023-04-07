import { IcoCar16, IcoIdCard16, IcoPassport16 } from '@onefootprint/icons';
import { IdDocType, IdDocUploadedEventData } from '@onefootprint/types';
import React from 'react';

const IconByIdDocType: Record<IdDocType, JSX.Element> = {
  [IdDocType.idCard]: <IcoIdCard16 />,
  [IdDocType.driversLicense]: <IcoCar16 />,
  [IdDocType.passport]: <IcoPassport16 />,
};

type IdDocUploadedEventIconProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventIcon = ({ data }: IdDocUploadedEventIconProps) =>
  IconByIdDocType[data.documentType] ?? <IcoIdCard16 />;

export default IdDocUploadedEventIcon;
