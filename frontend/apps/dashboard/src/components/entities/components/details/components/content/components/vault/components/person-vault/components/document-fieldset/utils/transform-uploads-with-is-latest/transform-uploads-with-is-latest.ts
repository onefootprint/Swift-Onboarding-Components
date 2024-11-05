import type { DocumentUpload } from '@onefootprint/types';

const getHighestVersionForIdentifier = (uploads: DocumentUpload[], identifier: string): number => {
  return Math.max(...uploads.filter(u => u.identifier === identifier).map(u => u.version));
};

// Add a field to each upload indicating whether it's the latest version
const transformUploadsWithIsLatest = (uploads: DocumentUpload[]): (DocumentUpload & { isLatest: boolean })[] => {
  const latestVersionByIdentifier = Object.fromEntries(
    uploads.map(u => [u.identifier, getHighestVersionForIdentifier(uploads, u.identifier)]),
  );
  return uploads.map(upload => ({
    ...upload,
    isLatest: upload.version === latestVersionByIdentifier[upload.identifier],
  }));
};

export default transformUploadsWithIsLatest;
