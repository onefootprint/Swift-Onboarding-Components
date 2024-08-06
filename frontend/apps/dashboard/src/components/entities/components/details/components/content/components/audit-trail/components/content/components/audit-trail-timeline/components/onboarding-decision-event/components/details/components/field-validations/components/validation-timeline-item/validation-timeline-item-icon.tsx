import {
  IcoBuilding16,
  IcoCake16,
  IcoEmail16,
  IcoFileText16,
  IcoFileText216,
  IcoInfo16,
  IcoPhone16,
  IcoStore16,
  IcoUser16,
  IcoUsers16,
} from '@onefootprint/icons';
import { MatchSignalAttribute } from '@onefootprint/types/src/data/match-signal-attribute';

type ValidationTimelineItemIconProps = {
  attribute: string;
};

const ValidationTimelineItemIcon = ({ attribute }: ValidationTimelineItemIconProps) => {
  if (attribute === MatchSignalAttribute.name) {
    return <IcoUser16 />;
  }
  if (attribute === MatchSignalAttribute.email) {
    return <IcoEmail16 />;
  }
  if (attribute === MatchSignalAttribute.phone || attribute === MatchSignalAttribute.businessPhoneNumber) {
    return <IcoPhone16 />;
  }
  if (attribute === MatchSignalAttribute.address || attribute === MatchSignalAttribute.businessAddress) {
    return <IcoBuilding16 />;
  }
  if (attribute === MatchSignalAttribute.dob) {
    return <IcoCake16 />;
  }
  if (attribute === MatchSignalAttribute.ssn) {
    return <IcoFileText216 />;
  }
  if (attribute === MatchSignalAttribute.document) {
    return <IcoFileText16 />;
  }
  if (attribute === MatchSignalAttribute.businessName) {
    return <IcoStore16 />;
  }
  if (attribute === MatchSignalAttribute.businessTIN) {
    return <IcoInfo16 />;
  }
  if (attribute === MatchSignalAttribute.businessBeneficialOwners) {
    return <IcoUsers16 />;
  }
  return null;
};

export default ValidationTimelineItemIcon;
