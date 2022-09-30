import { CountryCode3, IdScanBadImageError, IdScanDocType } from '../data';

export type SubmitDocRequest = {
  authToken: string;
  id: string;
  frontImage: string;
  backImage?: string;
  documentType: IdScanDocType;
  countryCode: CountryCode3;
};

export type SubmitDocResponse = {
  status: 'pending' | 'complete';
  error?: {
    frontImageError?: IdScanBadImageError;
    backImageError?: IdScanBadImageError;
  };
};
