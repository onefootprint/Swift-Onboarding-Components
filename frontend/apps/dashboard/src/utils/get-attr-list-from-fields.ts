import { IdDocDataAttribute, UserDataAttribute } from '@onefootprint/types';

const getAttrListFromFields = (
  kycData: Partial<Record<UserDataAttribute, boolean>>,
  idDoc: Partial<Record<IdDocDataAttribute, boolean>>,
): { kycData: UserDataAttribute[]; idDoc: IdDocDataAttribute[] } => {
  const kycAttrs = Object.entries(kycData)
    .filter(entry => {
      const val = entry[1];
      return !!val;
    })
    .map(entry => {
      const attr = entry[0];
      return attr;
    }) as UserDataAttribute[];
  const idDocAttrs = Object.entries(idDoc)
    .filter(entry => {
      const val = entry[1];
      return !!val;
    })
    .map(entry => {
      const attr = entry[0];
      return attr;
    }) as IdDocDataAttribute[];

  return { kycData: kycAttrs, idDoc: idDocAttrs };
};

export default getAttrListFromFields;
