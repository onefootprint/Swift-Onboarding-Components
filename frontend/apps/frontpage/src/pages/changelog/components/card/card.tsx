import { useIntl } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import type { PostDetails } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import CardContent from './components/card-content';
import Progress from './components/progress';

const DEFAULT_BLUR_COLOR = 'rgba(171, 255, 163, .15)';

type CardProps = {
  post: PostDetails;
  blurColor: string;
  showLine: boolean;
};

const Card = ({
  post,
  blurColor = DEFAULT_BLUR_COLOR,
  showLine,
}: CardProps) => {
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(post.published_at));

  return (
    <Container id={post.slug} blurColor={blurColor}>
      <DateDesktop>
        <Typography variant="label-3" color="tertiary">
          {formattedDate}
        </Typography>
      </DateDesktop>
      <Progress active={post.featured} showLine={showLine} />
      <Content>
        <CardContent post={post} />
      </Content>
    </Container>
  );
};

const Container = styled.div<{
  blurColor: string | 'rgba(171, 255, 163, .15)';
}>`
  ${({ theme, blurColor }) => css`
    display: flex;
    flex-direction: row;
    position: relative;
    height: auto;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    margin: auto;
    background: radial-gradient(
      50% 50% at 60% 30%,
      ${blurColor} 0%,
      ${theme.backgroundColor.primary} 75%
    );
  `}
`;

const DateDesktop = styled.div`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      display: flex;
      margin-top: ${theme.spacing[1]};
      text-align: right;
      min-width: 136px;
      justify-content: flex-end;
    `}
  `}
`;

const Content = styled.div`
  max-width: 830px;
  width: 100%;
`;

export default Card;
