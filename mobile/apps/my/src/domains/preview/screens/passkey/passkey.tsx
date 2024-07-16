import { IcoFaceid40 } from '@onefootprint/icons';
import { Box, Button, Container, LinkButton, Typography } from '@onefootprint/ui';
import base64url from 'base64url';
import React from 'react';
import { Passkey } from 'react-native-passkey';

import useTranslation from '@/hooks/use-translation';

const challenge =
  '{"publicKey":{"rp":{"name":"Footprint","id":"onefootprint.com"},"user":{"id":"dXZfam9tOUtnZktvemxuaGo2aFRYRnFMdQ","name":"Footprint","displayName":"Footprint"},"challenge":"1f-ORHWlQh0a87HeGaFL4ERIONdjUIcExOCuWMBou24","pubKeyCredParams":[{"type":"public-key","alg":-7},{"type":"public-key","alg":-257}],"timeout":120000,"attestation":"direct","authenticatorSelection":{"authenticatorAttachment":"platform","requireResidentKey":false,"userVerification":"required"}}}';

export type RegisterProps = {
  onContinue: () => void;
};

const Register = ({ onContinue }: RegisterProps) => {
  const { t } = useTranslation('components.passkeys.register');

  const handleRegister = async () => {
    const challengeJson = JSON.parse(challenge);
    const { publicKey } = challengeJson;
    await Passkey.register({
      challenge: base64url.toBase64(publicKey.challenge as unknown as string),
      rp: {
        id: publicKey.rp.id,
        name: publicKey.rp.name,
      },
      user: {
        id: base64url.toBase64(publicKey.user.id as unknown as string),
        name: publicKey.user.name,
        displayName: publicKey.user.displayName,
      },
      pubKeyCredParams: publicKey.pubKeyCredParams,
      timeout: publicKey.timeout,
      attestation: publicKey.attestation,
      authenticatorSelection: publicKey.authenticatorSelection,
    });
    onContinue();
  };

  return (
    <Container center>
      <IcoFaceid40 />
      <Typography variant="heading-3" marginBottom={3} marginTop={4} center>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center color="secondary">
        {t('subtitle')}
      </Typography>
      <Box width="100%" gap={7}>
        <Button onPress={handleRegister}>{t('cta')}</Button>
        <LinkButton onPress={handleRegister}>{t('skip')}</LinkButton>
      </Box>
    </Container>
  );
};

export default Register;
