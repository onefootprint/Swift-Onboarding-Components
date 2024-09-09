/* eslint-disable react/jsx-props-no-spreading */
import type { FontVariant } from '@onefootprint/design-tokens';
import type { BoxStyleProps, LinkButtonVariant } from '@onefootprint/ui';
import { LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useTruncatedtext, { ShownTextState } from './hooks/use-truncated-text';

type TruncatedTextProps = {
  text: string;
  maxTextViewHeight: number;
  textFontVariant: FontVariant;
  textStyleProps?: BoxStyleProps;
  seeMoreButtonVariant?: LinkButtonVariant;
};

const TruncatedText = ({ text, maxTextViewHeight, textFontVariant, textStyleProps }: TruncatedTextProps) => {
  const { textContainerRef, shownTextState, currShownText, showMoreOrLessText } = useTruncatedtext(
    text,
    maxTextViewHeight,
  );
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.truncated-text',
  });

  return (
    <Text ref={textContainerRef} variant={textFontVariant} {...textStyleProps}>
      <bdi>{currShownText}</bdi>
      {shownTextState !== ShownTextState.FULL_WITHIN_MAX_HEIGHT && (
        <LinkButton variant="label-3" onClick={showMoreOrLessText} $marginLeft={2}>
          {shownTextState === ShownTextState.PARTIAL_WITHIN_MAX_HEIGHT ? t('see-more') : t('see-less')}
        </LinkButton>
      )}
    </Text>
  );
};

export default TruncatedText;
