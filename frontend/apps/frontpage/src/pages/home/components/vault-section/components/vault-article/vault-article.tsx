import IcoLock24 from 'icons/ico/ico-lock-24';
import React from 'react';
import CircleIcon from 'src/components/circle-icon';
import styled, { css } from 'styled';
import { Typography } from 'ui';

type VaultArticleProps = {
  title: string;
  content: string;
};

const VaultArticle = ({ title, content }: VaultArticleProps) => (
  <>
    <CircleContainer>
      <CircleIcon Icon={IcoLock24} />
    </CircleContainer>
    <Typography
      as="p"
      color="primary"
      sx={{ marginBottom: 4 }}
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
    padding-bottom: ${theme.spacing[7]}px;
  `}
`;

export default VaultArticle;
