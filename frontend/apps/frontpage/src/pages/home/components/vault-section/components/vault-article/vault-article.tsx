import type { Icon as TIcon } from 'icons';
import React from 'react';
import CircleIcon from 'src/components/circle-icon';
import styled, { css } from 'styled';
import { Typography } from 'ui';

type VaultArticleProps = {
  content: string;
  Icon: TIcon;
  title: string;
};

const VaultArticle = ({ content, Icon, title }: VaultArticleProps) => (
  <>
    <CircleContainer>
      <CircleIcon Icon={Icon} color="quinary" />
    </CircleContainer>
    <Typography
      as="p"
      color="primary"
      sx={{ marginBottom: 5 }}
      variant="heading-3"
    >
      {title}
    </Typography>
    <Typography variant="body-1" color="secondary" as="p">
      {content}
    </Typography>
  </>
);

const CircleContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[8]}px;
  `}
`;

export default VaultArticle;
