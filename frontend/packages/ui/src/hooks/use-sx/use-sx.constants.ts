import type { ThemeKey } from '@onefootprint/themes';

import type { CustomStyleProps, SXStylesKeys } from './use-sx.types';

export const customPropStyles: Array<keyof CustomStyleProps> = [
  'backgroundColor',
  'borderBottomColor',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomWidth',
  'borderColor',
  'borderLeftColor',
  'borderLeftWidth',
  'borderRadius',
  'borderRightColor',
  'borderRightWidth',
  'borderTopColor',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopWidth',
  'borderWidth',
  'elevation',
  'color',
  'columnGap',
  'gap',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginX',
  'marginY',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingX',
  'paddingY',
  'rowGap',
];

export const customPropThemeMapper: Record<keyof CustomStyleProps, ThemeKey> = {
  backgroundColor: 'backgroundColor',
  borderBottomColor: 'borderColor',
  borderBottomLeftRadius: 'borderRadius',
  borderBottomRightRadius: 'borderRadius',
  borderBottomWidth: 'borderWidth',
  borderColor: 'borderColor',
  borderLeftColor: 'borderColor',
  borderLeftWidth: 'borderWidth',
  borderRadius: 'borderRadius',
  borderRightColor: 'borderColor',
  borderRightWidth: 'borderWidth',
  borderTopColor: 'borderColor',
  borderTopLeftRadius: 'borderRadius',
  borderTopRightRadius: 'borderRadius',
  borderTopWidth: 'borderWidth',
  borderWidth: 'borderWidth',
  elevation: 'elevation',
  color: 'color',
  columnGap: 'spacing',
  gap: 'spacing',
  margin: 'spacing',
  marginBottom: 'spacing',
  marginLeft: 'spacing',
  marginRight: 'spacing',
  marginTop: 'spacing',
  marginX: 'spacing',
  marginY: 'spacing',
  padding: 'spacing',
  paddingBottom: 'spacing',
  paddingLeft: 'spacing',
  paddingRight: 'spacing',
  paddingTop: 'spacing',
  paddingX: 'spacing',
  paddingY: 'spacing',
  rowGap: 'spacing',
} as const;

export const customPropNativeMapper: Record<
  keyof CustomStyleProps,
  SXStylesKeys[]
> = {
  backgroundColor: ['backgroundColor'],
  borderBottomColor: ['borderBottomColor'],
  borderBottomLeftRadius: ['borderBottomLeftRadius'],
  borderBottomRightRadius: ['borderBottomRightRadius'],
  borderBottomWidth: ['borderBottomWidth'],
  borderColor: ['borderColor'],
  borderLeftColor: ['borderLeftColor'],
  borderLeftWidth: ['borderLeftWidth'],
  borderRadius: ['borderRadius'],
  borderRightColor: ['borderRightColor'],
  borderRightWidth: ['borderRightWidth'],
  borderTopColor: ['borderTopColor'],
  borderTopLeftRadius: ['borderTopLeftRadius'],
  borderTopRightRadius: ['borderTopRightRadius'],
  borderTopWidth: ['borderTopWidth'],
  borderWidth: ['borderWidth'],
  color: ['color'],
  columnGap: ['columnGap'],
  elevation: ['boxShadow'],
  gap: ['gap'],
  margin: ['margin'],
  marginBottom: ['marginBottom'],
  marginLeft: ['marginLeft'],
  marginRight: ['marginRight'],
  marginTop: ['marginTop'],
  marginX: ['marginLeft', 'marginRight'],
  marginY: ['marginTop', 'marginBottom'],
  padding: ['padding'],
  paddingBottom: ['paddingBottom'],
  paddingLeft: ['paddingLeft'],
  paddingRight: ['paddingRight'],
  paddingTop: ['paddingTop'],
  paddingX: ['paddingLeft', 'paddingRight'],
  paddingY: ['paddingTop', 'paddingBottom'],
  rowGap: ['rowGap'],
};
