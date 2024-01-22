export type Language = {
  code: string;
  name: string;
};

export type LanguageSelectProps = {
  languageList?: Language[];
  activeLanguage: Language;
  onLanguageChange: (language: Language) => void;
};

export enum LanguageCodes {
  EN = 'en',
  ES = 'es',
}

export const languageBaseList = [
  { code: LanguageCodes.EN, name: 'English' },
  { code: LanguageCodes.ES, name: 'Español' },
];
