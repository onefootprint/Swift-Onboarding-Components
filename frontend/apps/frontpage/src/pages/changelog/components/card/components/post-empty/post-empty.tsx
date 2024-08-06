import { Text } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const PostEmpty = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.changelog' });
  return (
    <Container>
      <Image src="/home/banner/penguin.png" alt="penguin" height={240} width={320} />
      <Text variant="display-3">{t('empty.title')}</Text>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[10]} ${theme.spacing[12]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    margin: ${theme.spacing[10]} auto;
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default PostEmpty;
