import type { UIState } from '@onefootprint/design-tokens';
import { IcoInfo16 } from '@onefootprint/icons';
import { Badge, Stack, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useSession, { User } from 'src/hooks/use-session';
import { HydratedArticle } from 'src/pages/api-reference/hooks';
import { ArticleTag } from 'src/pages/api-reference/hooks/use-hydrate-articles';
import styled, { css } from 'styled-components';

type TagsProps = {
  article: HydratedArticle;
};

const Tags = ({ article }: TagsProps) => {
  const {
    data: { user },
  } = useSession();
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference.tags' });

  const identifyingTag = getIdentifyingTag(article, user);

  return (
    <Stack direction="row" gap={2} flexShrink={0}>
      {article.hideWhenLocked && user?.isFirmEmployee && (
        <Tooltip text={t('hide-when-locked-tooltip')}>
          <Badge variant="warning">{t('hide-when-locked')}</Badge>
        </Tooltip>
      )}
      {identifyingTag && (
        <Tooltip text={identifyingTag.tooltip}>
          <Badge variant={identifyingTag.variant}>{identifyingTag.text}</Badge>
        </Tooltip>
      )}
      {!article.canAccessApi && (
        <Tooltip text={t('locked-tooltip')}>
          <Badge variant="warning" whiteSpace="nowrap">
            <span>{t('locked')}</span>
            <PaddedIcoInfo16 color="warning" />
          </Badge>
        </Tooltip>
      )}
    </Stack>
  );
};

type IdentifyingTag = {
  text: string;
  tooltip: string;
  variant: UIState;
};

const getIdentifyingTag = (article: HydratedArticle, user?: User): IdentifyingTag | undefined => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference.tags' });

  if (article.tag === ArticleTag.phasedOut && user?.isFirmEmployee) {
    // Only show a warning to employees that the API is deprecated
    return {
      text: t('phased-out'),
      tooltip: t('phased-out-tooltip'),
      variant: 'warning',
    };
  }

  if (article.tag === ArticleTag.preview) {
    return {
      text: t('preview'),
      tooltip: t('preview-tooltip'),
      variant: 'neutral',
    };
  }
};

const PaddedIcoInfo16 = styled(IcoInfo16)`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `}
`;

export default Tags;
