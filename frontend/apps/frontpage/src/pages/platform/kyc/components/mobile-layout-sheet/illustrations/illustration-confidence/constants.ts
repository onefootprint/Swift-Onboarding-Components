import {
  IcoBuilding16,
  IcoCake16,
  IcoCar16,
  IcoEmail16,
  IcoFileText16,
  IcoPhone16,
  IcoSelfie16,
  IcoUserCircle16,
} from '@onefootprint/icons';

// eslint-disable-next-line import/prefer-default-export
export const tagKeys = [
  {
    key: 'email',
    icon: IcoEmail16,
    order: 1,
  },
  {
    key: 'phone-number',
    icon: IcoPhone16,
    order: 2,
  },
  {
    key: 'name',
    icon: IcoUserCircle16,
    order: 3,
  },
  {
    key: 'date-of-birth',
    icon: IcoCake16,
    order: 4,
  },
  {
    key: 'address',
    icon: IcoBuilding16,
    order: 5,
  },

  {
    key: 'ssn',
    icon: IcoFileText16,
    order: 6,
  },
  {
    key: 'selfie',
    icon: IcoSelfie16,
    order: 7,
  },
  {
    key: 'drivers-license',
    icon: IcoCar16,
    order: 8,
  },
];
