import { Stack, useObjectUrl } from '@onefootprint/ui';
import DocViewer from './components/doc-viewer';
import ImgThumb from './components/img-thumb';

type DocumentUploadedProps = {
  base64Data: string;
  documentName: string;
  isSuccess: boolean;
};

const DocumentUploaded = ({ base64Data, documentName, isSuccess }: DocumentUploadedProps) => {
  const { objectUrl, mimeType } = useObjectUrl(base64Data);
  const isPdf = mimeType === 'application/pdf';

  return objectUrl ? (
    <Stack direction="column" gap={5}>
      <DocViewer src={objectUrl} mimeType={mimeType} documentName={documentName}>
        {isPdf ? null : <ImgThumb src={objectUrl} isSuccess={isSuccess} />}
      </DocViewer>
    </Stack>
  ) : null;
};

export default DocumentUploaded;
