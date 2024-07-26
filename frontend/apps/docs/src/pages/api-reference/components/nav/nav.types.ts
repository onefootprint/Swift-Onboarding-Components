import type { Article } from '../../api-reference.types';

export type SupportFormData = {
  [FormField.name]: string;
  [FormField.email]: string;
  [FormField.message]: string;
};

export enum FormField {
  email = 'email',
  name = 'name',
  message = 'message',
}

export type Navigation = NavigationSection[];

export type NavigationSection = {
  title: string;
  subsections: NavigationSubsection[];
};

export type NavigationSubsection = {
  method: 'post' | 'get' | 'put' | 'delete' | 'patch';
  path: string;
  id: string;
};

export type PageNavProps = {
  sections: PageNavSection[];
};

export type PageNavSection = {
  title: string;
  isPreview: boolean;
  articles: Article[];
};
