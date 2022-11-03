import type { Icon } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import CircleIcon from 'src/components/circle-icon';
import styled, { css } from 'styled-components';

type VaultArticleProps = {
  content: string;
  iconComponent: Icon;
  title: string;
};

const VaultArticle = ({
  content,
  iconComponent: Icon,
  title,
}: VaultArticleProps) => (
  <>
    <CircleContainer>
      <CircleIcon iconComponent={Icon} color="quinary" />
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
    margin-bottom: ${theme.spacing[8]};
  `}
`;

export default VaultArticle;
