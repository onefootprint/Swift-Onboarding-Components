import { type Document, type DocumentDI, type EntityVault, RawJsonKinds } from '@onefootprint/types';

const getRawJsonData = (vault: EntityVault, document: Document) => {
  const rawJsonKinds: RawJsonKinds[] = Object.values(RawJsonKinds);
  const rawJsonData: {
    rawJsonKind: RawJsonKinds;
    rawJsonData: string;
  }[] = [];
  const { kind: documentKind, curpCompletedVersion, sambaActivityHistoryCompletedVersion } = document;

  rawJsonKinds.forEach(kind => {
    let completedVersion;
    if (kind === RawJsonKinds.CurpValidationResponse && curpCompletedVersion) {
      completedVersion = curpCompletedVersion;
    }
    if (kind === RawJsonKinds.SambaActivityHistoryResponse && sambaActivityHistoryCompletedVersion) {
      completedVersion = sambaActivityHistoryCompletedVersion;
    }
    const di = `document.${documentKind}.${kind}:${completedVersion}` as DocumentDI;
    if (typeof vault[di] === 'string') {
      rawJsonData.push({
        rawJsonKind: kind,
        rawJsonData: vault[di] as string,
      });
    }
  });

  return rawJsonData;
};

export default getRawJsonData;
