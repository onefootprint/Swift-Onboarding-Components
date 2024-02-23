import type { FontVariant } from '@onefootprint/design-tokens';
import type {
  LinkButtonSize,
  LinkButtonVariant,
  SXStyleProps,
} from '@onefootprint/ui';
import { LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useTruncatedtext, { ShownTextState } from './hooks/use-truncated-text';

type TruncatedTextProps = {
  text: string;
  maxTextViewHeight: number;
  textFontVariant: FontVariant;
  textSxStyle?: SXStyleProps;
  seeMoreButtonVariant?: LinkButtonVariant;
  seeMoreButtonSize?: LinkButtonSize;
};

const TruncatedText = ({
  text,
  maxTextViewHeight,
  textFontVariant,
  textSxStyle,
  seeMoreButtonVariant = 'default',
  seeMoreButtonSize = 'compact',
}: TruncatedTextProps) => {
  const {
    textContainerRef,
    shownTextState,
    currShownText,
    showMoreOrLessText,
  } = useTruncatedtext(text, maxTextViewHeight);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.truncated-text',
  });

  return (
    <Text ref={textContainerRef} variant={textFontVariant} sx={textSxStyle}>
      <bdi>{currShownText}</bdi>
      {shownTextState !== ShownTextState.FULL_WITHIN_MAX_HEIGHT && (
        <LinkButton
          variant={seeMoreButtonVariant}
          onClick={showMoreOrLessText}
          size={seeMoreButtonSize}
          sx={{ marginLeft: 2 }}
        >
          {shownTextState === ShownTextState.PARTIAL_WITHIN_MAX_HEIGHT
            ? t('see-more')
            : t('see-less')}
        </LinkButton>
      )}
    </Text>
  );
};

export default TruncatedText;
