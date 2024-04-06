import type { FormEvent } from 'react';

type ElementWithValue = Element & { value?: string };

const getFormElementValue =
  (selector: string) =>
  (event: FormEvent<HTMLFormElement>): string => {
    const form = event.target as HTMLFormElement;
    const el: ElementWithValue | null = form.querySelector(selector);

    return (el?.value || '').trim();
  };

export default getFormElementValue;
