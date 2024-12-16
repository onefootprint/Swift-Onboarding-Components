export type FormData = Partial<{
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;

  // Address data
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;

  // custom data
  category: string;
  awd: string;
  reservedCarClass: string;
  elor: number;
  rentalZone: string;
  under24hRental: boolean;
  businessLeisure: boolean;
  localMarketIndicator: boolean;
  distributionChannel: string;
}>;
