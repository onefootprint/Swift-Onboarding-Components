import {
  IcoCar16,
  IcoClipboard16,
  IcoHome16,
  IcoIdCard16,
  IcoPassport16,
  IcoSsnCard16,
  IcoVoter16,
  IcoWriting16,
} from '@onefootprint/icons';
import type { IdDocUploadedEventData } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

// modern doc type here
const IconByIdDocType: Record<SupportedIdDocTypes, JSX.Element> = {
  [SupportedIdDocTypes.idCard]: <IcoIdCard16 />,
  [SupportedIdDocTypes.driversLicense]: <IcoCar16 />,
  [SupportedIdDocTypes.passport]: <IcoPassport16 />,
  [SupportedIdDocTypes.workPermit]: <IcoClipboard16 />,
  [SupportedIdDocTypes.residenceDocument]: <IcoHome16 />,
  [SupportedIdDocTypes.visa]: <IcoWriting16 />,
  [SupportedIdDocTypes.voterIdentification]: <IcoVoter16 />,
  [SupportedIdDocTypes.ssnCard]: <IcoSsnCard16 />,
};

type IdDocUploadedEventIconProps = {
  data: IdDocUploadedEventData;
};

const IdDocUploadedEventIcon = ({ data }: IdDocUploadedEventIconProps) =>
  IconByIdDocType[data.documentType] ?? <IcoIdCard16 />;

export default IdDocUploadedEventIcon;
