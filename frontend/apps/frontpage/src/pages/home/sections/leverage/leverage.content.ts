import type { Icon } from '@onefootprint/icons';
import {
  IcoFaceid16,
  IcoQuestionMark16,
  IcoShield16,
  IcoSmartphone16,
  IcoSquareFrame16,
  IcoUserCircle16,
  IcoUsers16,
} from '@onefootprint/icons';

export type SectionOptions = 'app-clip' | 'passkeys';

const content: {
  section: SectionOptions;
  phoneImg: string;
  bullets: { icon: Icon; translation: string }[];
}[] = [
  {
    section: 'app-clip',
    phoneImg: '/home/leverage/app-clip.png',
    bullets: [
      {
        icon: IcoSquareFrame16,
        translation: 'doc-scanning',
      },
      {
        icon: IcoSmartphone16,
        translation: 'real-phone',
      },
      {
        icon: IcoQuestionMark16,
        translation: 'device-attestation',
      },
      {
        icon: IcoUsers16,
        translation: 'duplicate-fraud',
      },
    ],
  },
  {
    section: 'passkeys',
    phoneImg: '/home/leverage/passkeys.png',
    bullets: [
      {
        icon: IcoFaceid16,
        translation: 'identity-and-device',
      },
      {
        icon: IcoSmartphone16,
        translation: 'prevent-ato',
      },
      {
        icon: IcoUserCircle16,
        translation: 'same-person',
      },
      {
        icon: IcoShield16,
        translation: 'link-kyc-and-auth',
      },
    ],
  },
];

export default content;
