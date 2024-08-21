import { Button, Dialog, LinkButton, Stack, Text } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import * as openpgp from 'openpgp';
import type React from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type PgpUploadToolProps = {
  open: boolean;
  onClose: () => void;
};

const PgpUploadTool = ({ open, onClose }: PgpUploadToolProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.pgp-helper-tool',
  });

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    inputFileRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const [file] = event.target.files;
    const encryptedBlob = await encryptFile(file, publicKeyArmored);

    saveAs(URL.createObjectURL(encryptedBlob), `${file.name}.pgp`);
    onClose();
  };

  return (
    <Dialog size="compact" open={open} onClose={onClose} title={t('title')}>
      <Stack direction="column" gap={3}>
        <Text variant="body-4" justifyContent="justify">
          {t('description')}
        </Text>
        <HiddenInput type="file" onChange={handleChange} ref={inputFileRef} />
        <br />
        <Button variant="primary" onClick={handleOpenFile} fullWidth={false}>
          {t('select-file-button-title')}
        </Button>
        <br />
        <Stack direction="row" align="stretch" justify="space-between">
          <LinkButton
            variant="caption-2"
            href="https://docs.onefootprint.com/articles/integrate/migrate-existing-data#manual-migration-assistance-footprint-pgp-instructions"
            target="_blank"
          >
            {t('manual-pgp-instructions-link-title')}
          </LinkButton>
          <LinkButton
            variant="caption-2"
            href="https://docs.onefootprint.com/articles/integrate/migrate-existing-data#manual-migration-assistance-footprint-pgp-public-key"
            target="_blank"
          >
            {t('public-key-link-title')}
          </LinkButton>
        </Stack>
      </Stack>
    </Dialog>
  );
};

async function encryptFile(file: File, publicKeyArmored: string): Promise<Blob> {
  const publicKey = await openpgp.key.readArmored(publicKeyArmored);

  const fileBuffer = await file.arrayBuffer();
  const message = await openpgp.message.fromBinary(new Uint8Array(fileBuffer));

  const encrypted = await openpgp.encrypt({
    message,
    publicKeys: publicKey.keys,
  });

  const encryptedBlob = new Blob([encrypted.data as BlobPart], { type: 'application/pgp-encrypted' });
  return encryptedBlob;
}

const HiddenInput = styled.input`
  display: none;
`;

const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----

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
OwC3wKkvTn6QpiPA9DDuE3PSp2ZZ
=EpSl
-----END PGP PUBLIC KEY BLOCK-----`;

export default PgpUploadTool;
