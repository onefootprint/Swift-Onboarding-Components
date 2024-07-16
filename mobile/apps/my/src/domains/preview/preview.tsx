import themes from '@onefootprint/design-tokens';
import { OnboardingRequirementKind, SupportedIdDocTypes } from '@onefootprint/types';
import { Box, DesignSystemProvider } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';

import IdDoc from '@/components/id-doc';
import { PREVIEW_AUTH_TOKEN } from '@/config/constants';
import configureReactI18next from '@/config/initializers/react-i18next';

import Banner from './components/banner';
import Completed from './screens/completed';
import Debug from './screens/debug';
import Passkey from './screens/passkey';

type PreviewProps = {
  isDemo: boolean;
  isDebug: boolean;
};

configureReactI18next();

const Preview = ({ isDemo, isDebug }: PreviewProps) => {
  const [showPasskey, setShowPasskey] = useState(true);
  const [showIdDoc, setShowIdDoc] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <DesignSystemProvider theme={themes.light}>
      {isDebug ? (
        <Debug />
      ) : (
        <Box>
          {showPasskey && (
            <>
              {isDemo && <Banner />}
              <Passkey
                onContinue={() => {
                  setShowPasskey(false);
                  setShowIdDoc(true);
                }}
              />
            </>
          )}
          {showIdDoc && (
            <IdDoc
              authToken={PREVIEW_AUTH_TOKEN}
              requirement={{
                isMet: false,
                kind: OnboardingRequirementKind.idDoc,
                shouldCollectConsent: false,
                shouldCollectSelfie: true,
                supportedCountryAndDocTypes: {
                  AI: [SupportedIdDocTypes.passport],
                  MV: [SupportedIdDocTypes.passport],
                  AX: [SupportedIdDocTypes.passport],
                  SN: [SupportedIdDocTypes.passport],
                  CW: [SupportedIdDocTypes.passport],
                  IO: [SupportedIdDocTypes.passport],
                  RO: [SupportedIdDocTypes.passport],
                  ME: [SupportedIdDocTypes.passport],
                  TR: [SupportedIdDocTypes.passport],
                  TT: [SupportedIdDocTypes.passport],
                  AZ: [SupportedIdDocTypes.passport],
                  TW: [SupportedIdDocTypes.passport],
                  KW: [SupportedIdDocTypes.passport],
                  TZ: [SupportedIdDocTypes.passport],
                  GM: [SupportedIdDocTypes.passport],
                  QA: [SupportedIdDocTypes.passport],
                  SJ: [SupportedIdDocTypes.passport],
                  AL: [SupportedIdDocTypes.passport],
                  BH: [SupportedIdDocTypes.passport],
                  PY: [SupportedIdDocTypes.passport],
                  OM: [SupportedIdDocTypes.passport],
                  GN: [SupportedIdDocTypes.passport],
                  SO: [SupportedIdDocTypes.passport],
                  AT: [SupportedIdDocTypes.passport],
                  MH: [SupportedIdDocTypes.passport],
                  AR: [SupportedIdDocTypes.passport],
                  CK: [SupportedIdDocTypes.passport],
                  HT: [SupportedIdDocTypes.passport],
                  BY: [SupportedIdDocTypes.passport],
                  TF: [SupportedIdDocTypes.passport],
                  TN: [SupportedIdDocTypes.passport],
                  BE: [SupportedIdDocTypes.passport],
                  GP: [SupportedIdDocTypes.passport],
                  NG: [SupportedIdDocTypes.passport],
                  CA: [SupportedIdDocTypes.passport],
                  CC: [SupportedIdDocTypes.passport],
                  CO: [SupportedIdDocTypes.passport],
                  BZ: [SupportedIdDocTypes.passport],
                  SR: [SupportedIdDocTypes.passport],
                  KG: [SupportedIdDocTypes.passport],
                  EC: [SupportedIdDocTypes.passport],
                  BF: [SupportedIdDocTypes.passport],
                  IT: [SupportedIdDocTypes.passport],
                  TV: [SupportedIdDocTypes.passport],
                  GL: [SupportedIdDocTypes.passport],
                  VE: [SupportedIdDocTypes.passport],
                  BI: [SupportedIdDocTypes.passport],
                  CR: [SupportedIdDocTypes.passport],
                  CD: [SupportedIdDocTypes.passport],
                  TL: [SupportedIdDocTypes.passport],
                  GU: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                  ],
                  DM: [SupportedIdDocTypes.passport],
                  GA: [SupportedIdDocTypes.passport],
                  GB: [SupportedIdDocTypes.passport],
                  IL: [SupportedIdDocTypes.passport],
                  FJ: [SupportedIdDocTypes.passport],
                  JO: [SupportedIdDocTypes.passport],
                  HM: [SupportedIdDocTypes.passport],
                  CG: [SupportedIdDocTypes.passport],
                  DE: [SupportedIdDocTypes.passport],
                  KZ: [SupportedIdDocTypes.passport],
                  TJ: [SupportedIdDocTypes.passport],
                  UZ: [SupportedIdDocTypes.passport],
                  NF: [SupportedIdDocTypes.passport],
                  LS: [SupportedIdDocTypes.passport],
                  JM: [SupportedIdDocTypes.passport],
                  SE: [SupportedIdDocTypes.passport],
                  RU: [SupportedIdDocTypes.passport],
                  PL: [SupportedIdDocTypes.passport],
                  MA: [SupportedIdDocTypes.passport],
                  SG: [SupportedIdDocTypes.passport],
                  RE: [SupportedIdDocTypes.passport],
                  SB: [SupportedIdDocTypes.passport],
                  GI: [SupportedIdDocTypes.passport],
                  MG: [SupportedIdDocTypes.passport],
                  VN: [SupportedIdDocTypes.passport],
                  NU: [SupportedIdDocTypes.passport],
                  UG: [SupportedIdDocTypes.passport],
                  GT: [SupportedIdDocTypes.passport],
                  LU: [SupportedIdDocTypes.passport],
                  AG: [SupportedIdDocTypes.passport],
                  KR: [SupportedIdDocTypes.passport],
                  MM: [SupportedIdDocTypes.passport],
                  RW: [SupportedIdDocTypes.passport],
                  IE: [SupportedIdDocTypes.passport],
                  TK: [SupportedIdDocTypes.passport],
                  CY: [SupportedIdDocTypes.passport],
                  CM: [SupportedIdDocTypes.passport],
                  NE: [SupportedIdDocTypes.passport],
                  PW: [SupportedIdDocTypes.passport],
                  GW: [SupportedIdDocTypes.passport],
                  LC: [SupportedIdDocTypes.passport],
                  AD: [SupportedIdDocTypes.passport],
                  BW: [SupportedIdDocTypes.passport],
                  BS: [SupportedIdDocTypes.passport],
                  EE: [SupportedIdDocTypes.passport],
                  DK: [SupportedIdDocTypes.passport],
                  NC: [SupportedIdDocTypes.passport],
                  NO: [SupportedIdDocTypes.passport],
                  WS: [SupportedIdDocTypes.passport],
                  HK: [SupportedIdDocTypes.passport],
                  PG: [SupportedIdDocTypes.passport],
                  MO: [SupportedIdDocTypes.passport],
                  SA: [SupportedIdDocTypes.passport],
                  HN: [SupportedIdDocTypes.passport],
                  MC: [SupportedIdDocTypes.passport],
                  DJ: [SupportedIdDocTypes.passport],
                  ST: [SupportedIdDocTypes.passport],
                  IM: [SupportedIdDocTypes.passport],
                  EG: [SupportedIdDocTypes.passport],
                  LR: [SupportedIdDocTypes.passport],
                  SV: [SupportedIdDocTypes.passport],
                  MR: [SupportedIdDocTypes.passport],
                  RS: [SupportedIdDocTypes.passport],
                  LY: [SupportedIdDocTypes.passport],
                  GY: [SupportedIdDocTypes.passport],
                  MN: [SupportedIdDocTypes.passport],
                  PH: [SupportedIdDocTypes.passport],
                  LT: [SupportedIdDocTypes.passport],
                  KH: [SupportedIdDocTypes.passport],
                  MY: [SupportedIdDocTypes.passport],
                  VG: [SupportedIdDocTypes.passport],
                  LK: [SupportedIdDocTypes.passport],
                  SS: [SupportedIdDocTypes.passport],
                  EH: [SupportedIdDocTypes.passport],
                  MQ: [SupportedIdDocTypes.passport],
                  GR: [SupportedIdDocTypes.passport],
                  SH: [SupportedIdDocTypes.passport],
                  NZ: [SupportedIdDocTypes.passport],
                  SX: [SupportedIdDocTypes.passport],
                  ZA: [SupportedIdDocTypes.passport],
                  VC: [SupportedIdDocTypes.passport],
                  NA: [SupportedIdDocTypes.passport],
                  UY: [SupportedIdDocTypes.passport],
                  BB: [SupportedIdDocTypes.passport],
                  ZM: [SupportedIdDocTypes.passport],
                  PA: [SupportedIdDocTypes.passport],
                  MS: [SupportedIdDocTypes.passport],
                  NI: [SupportedIdDocTypes.passport],
                  BO: [SupportedIdDocTypes.passport],
                  SZ: [SupportedIdDocTypes.passport],
                  VA: [SupportedIdDocTypes.passport],
                  LI: [SupportedIdDocTypes.passport],
                  CU: [SupportedIdDocTypes.passport],
                  JE: [SupportedIdDocTypes.passport],
                  MX: [SupportedIdDocTypes.passport],
                  BT: [SupportedIdDocTypes.passport],
                  PM: [SupportedIdDocTypes.passport],
                  TC: [SupportedIdDocTypes.passport],
                  ZW: [SupportedIdDocTypes.passport],
                  KI: [SupportedIdDocTypes.passport],
                  LB: [SupportedIdDocTypes.passport],
                  GD: [SupportedIdDocTypes.passport],
                  GG: [SupportedIdDocTypes.passport],
                  UA: [SupportedIdDocTypes.passport],
                  NL: [SupportedIdDocTypes.passport],
                  GH: [SupportedIdDocTypes.passport],
                  BL: [SupportedIdDocTypes.passport],
                  GF: [SupportedIdDocTypes.passport],
                  ER: [SupportedIdDocTypes.passport],
                  CZ: [SupportedIdDocTypes.passport],
                  FO: [SupportedIdDocTypes.passport],
                  FR: [SupportedIdDocTypes.passport],
                  TD: [SupportedIdDocTypes.passport],
                  WF: [SupportedIdDocTypes.passport],
                  SD: [SupportedIdDocTypes.passport],
                  PR: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                  ],
                  US: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                    SupportedIdDocTypes.voterIdentification,
                    SupportedIdDocTypes.passportCard,
                  ],
                  UM: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                  ],
                  SC: [SupportedIdDocTypes.passport],
                  PE: [SupportedIdDocTypes.passport],
                  CN: [SupportedIdDocTypes.passport],
                  AS: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                  ],
                  LV: [SupportedIdDocTypes.passport],
                  KM: [SupportedIdDocTypes.passport],
                  BV: [SupportedIdDocTypes.passport],
                  PF: [SupportedIdDocTypes.passport],
                  FK: [SupportedIdDocTypes.passport],
                  SY: [SupportedIdDocTypes.passport],
                  IN: [SupportedIdDocTypes.passport],
                  AE: [SupportedIdDocTypes.passport],
                  GE: [SupportedIdDocTypes.passport],
                  TG: [SupportedIdDocTypes.passport],
                  BR: [SupportedIdDocTypes.passport],
                  KY: [SupportedIdDocTypes.passport],
                  SK: [SupportedIdDocTypes.passport],
                  BJ: [SupportedIdDocTypes.passport],
                  YT: [SupportedIdDocTypes.passport],
                  VI: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                  ],
                  HR: [SupportedIdDocTypes.passport],
                  BQ: [SupportedIdDocTypes.passport],
                  SI: [SupportedIdDocTypes.passport],
                  JP: [SupportedIdDocTypes.passport],
                  MU: [SupportedIdDocTypes.passport],
                  IR: [SupportedIdDocTypes.passport],
                  ES: [SupportedIdDocTypes.passport],
                  BG: [SupportedIdDocTypes.passport],
                  BM: [SupportedIdDocTypes.passport],
                  BA: [SupportedIdDocTypes.passport],
                  ID: [SupportedIdDocTypes.passport],
                  TH: [SupportedIdDocTypes.passport],
                  FI: [SupportedIdDocTypes.passport],
                  TO: [SupportedIdDocTypes.passport],
                  AM: [SupportedIdDocTypes.passport],
                  CF: [SupportedIdDocTypes.passport],
                  MK: [SupportedIdDocTypes.passport],
                  CI: [SupportedIdDocTypes.passport],
                  FM: [SupportedIdDocTypes.passport],
                  PS: [SupportedIdDocTypes.passport],
                  SL: [SupportedIdDocTypes.passport],
                  ET: [SupportedIdDocTypes.passport],
                  DO: [SupportedIdDocTypes.passport],
                  MW: [SupportedIdDocTypes.passport],
                  BD: [SupportedIdDocTypes.passport],
                  NP: [SupportedIdDocTypes.passport],
                  PN: [SupportedIdDocTypes.passport],
                  GS: [SupportedIdDocTypes.passport],
                  HU: [SupportedIdDocTypes.passport],
                  DZ: [SupportedIdDocTypes.passport],
                  MF: [SupportedIdDocTypes.passport],
                  KE: [SupportedIdDocTypes.passport],
                  LA: [SupportedIdDocTypes.passport],
                  CX: [SupportedIdDocTypes.passport],
                  BN: [SupportedIdDocTypes.passport],
                  CL: [SupportedIdDocTypes.passport],
                  MD: [SupportedIdDocTypes.passport],
                  MP: [
                    SupportedIdDocTypes.idCard,
                    SupportedIdDocTypes.driversLicense,
                    SupportedIdDocTypes.passport,
                    SupportedIdDocTypes.workPermit,
                    SupportedIdDocTypes.visa,
                    SupportedIdDocTypes.residenceDocument,
                  ],
                  IQ: [SupportedIdDocTypes.passport],
                  YE: [SupportedIdDocTypes.passport],
                  GQ: [SupportedIdDocTypes.passport],
                  MZ: [SupportedIdDocTypes.passport],
                  CV: [SupportedIdDocTypes.passport],
                  KN: [SupportedIdDocTypes.passport],
                  VU: [SupportedIdDocTypes.passport],
                  SM: [SupportedIdDocTypes.passport],
                  NR: [SupportedIdDocTypes.passport],
                  ML: [SupportedIdDocTypes.passport],
                  CH: [SupportedIdDocTypes.passport],
                  AU: [SupportedIdDocTypes.passport],
                  AF: [SupportedIdDocTypes.passport],
                  PK: [SupportedIdDocTypes.passport],
                  PT: [SupportedIdDocTypes.passport],
                  AW: [SupportedIdDocTypes.passport],
                  IS: [SupportedIdDocTypes.passport],
                  MT: [SupportedIdDocTypes.passport],
                  AO: [SupportedIdDocTypes.passport],
                  TM: [SupportedIdDocTypes.passport],
                },
              }}
              onDone={() => {
                setShowIdDoc(false);
                setShowComplete(true);
              }}
            />
          )}
          {showComplete && (
            <Completed
              onDone={() => {
                setShowComplete(false);
                setShowPasskey(true);
              }}
            />
          )}
        </Box>
      )}
    </DesignSystemProvider>
  );
};

export default Preview;
