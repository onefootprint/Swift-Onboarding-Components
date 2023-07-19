import { IcoCar16, IcoIdCard16, IcoPassport16 } from '@onefootprint/icons';
import {
  IdDocUploadedEventData,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

// modern doc type here
const IconByIdDocType: Record<SupportedIdDocTypes, JSX.Element> = {
  [SupportedIdDocTypes.idCard]: <IcoIdCard16 />,
  [SupportedIdDocTypes.driversLicense]: <IcoCar16 />,
  [SupportedIdDocTypes.passport]: <IcoPassport16 />,
};

type IdDocUploadedEventIconProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventIcon = ({ data }: IdDocUploadedEventIconProps) =>
  IconByIdDocType[data.documentType] ?? <IcoIdCard16 />;

export default IdDocUploadedEventIcon;
