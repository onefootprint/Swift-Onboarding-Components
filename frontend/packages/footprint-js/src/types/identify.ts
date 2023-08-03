export type IdentifyRequest = {
  identifier: { email: string } | { phone_number: string };
};
