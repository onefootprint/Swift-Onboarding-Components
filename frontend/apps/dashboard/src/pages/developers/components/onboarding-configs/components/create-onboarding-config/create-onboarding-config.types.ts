import { DataKinds, VirtualDataKinds } from 'src/types/data-kind';

export type NameFormData = {
  name: string;
};

export type DataKindForm = {
  [DataKinds.dob]: boolean;
  [DataKinds.email]: boolean;
  [DataKinds.ssn4]: boolean;
  [DataKinds.phoneNumber]: boolean;
  [DataKinds.ssn9]: boolean;
  [VirtualDataKinds.addressFull]: boolean;
  [VirtualDataKinds.addressPartial]: boolean;
  [VirtualDataKinds.name]: boolean;
};
