import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type FooterProps = {
  onBack: () => void;
  form?: string;
};

const Footer = ({ onBack, form }: FooterProps) => {
  const { t } = useTranslation('common');

  return (
    <ButtonContainer>
      <Button variant="secondary" onClick={onBack}>
        {t('back')}
      </Button>
      <Button type="submit" form={form}>
        {t('next')}
      </Button>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export default Footer;
