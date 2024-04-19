import {
  IcoCar16,
  IcoClipboard16,
  IcoHome16,
  IcoIdCard16,
  IcoPassport16,
  IcoPassportCard16,
  IcoSsnCard16,
  IcoVoter16,
  IcoWriting16,
} from '@onefootprint/icons';
import type { DocumentUploadedEventData } from '@onefootprint/types';
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
  [SupportedIdDocTypes.lease]: <IcoWriting16 />,
  [SupportedIdDocTypes.bankStatement]: <IcoWriting16 />,
  [SupportedIdDocTypes.utilityBill]: <IcoWriting16 />,
  [SupportedIdDocTypes.proofOfAddress]: <IcoWriting16 />,
  [SupportedIdDocTypes.passportCard]: <IcoPassportCard16 />,
};

type DocumentUploadedEventIconProps = {
  data: DocumentUploadedEventData;
};

const DocumentUploadedEventIcon = ({ data }: DocumentUploadedEventIconProps) =>
  IconByIdDocType[data.documentType] ?? <IcoIdCard16 />;

export default DocumentUploadedEventIcon;
