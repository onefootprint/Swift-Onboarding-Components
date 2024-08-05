export type RawBusinessAddress = {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string | null;
  sources: string | null;
  submitted: boolean | null;
  deliverable: boolean | null;
  verified: boolean | null;
  cmra: boolean | null;
};

export type BusinessAddress = {
  id: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string | null;
  sources: string | null;
  submitted: boolean | null;
  deliverable: boolean | null;
  verified: boolean | null;
  cmra: boolean | null;
};
