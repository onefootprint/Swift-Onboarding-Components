import type { FootprintFormRef } from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button, useToast } from '@onefootprint/ui';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import fakeSdk from '../../../../../helpers/fake-sdk';
import getQueryArgs from '../../../../../helpers/get-query-args';

type DemoFormProps = { authToken: string };

const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const fallbackAppUrl = ENV === 'production' ? 'https://components.onefootprint.com' : 'http://localhost:3010/form';

const getFormArgs = (o: ReturnType<typeof getQueryArgs>) => ({
  ...o,
  appUrl:
    o.appUrl.startsWith('https://components') || o.appUrl.startsWith('http://localhost') ? o.appUrl : fallbackAppUrl,
});

const formSetup = (
  authToken: string,
  setRef: React.Dispatch<React.SetStateAction<FootprintFormRef | undefined>>,
  toast: ReturnType<typeof useToast>,
) => {
  const component = fakeSdk.init({
    kind: FootprintComponentKind.Form,
    authToken,
    title: 'Add a New Card',
    variant: 'inline',
    containerId: 'footprint-secure-form',
    getRef: setRef,
    onComplete: () => {
      toast.show({
        title: 'Success',
        description: 'Successfully completed form',
      });
    },
    onCancel: () => {
      toast.show({ title: 'Canceled', description: 'User canceled form' });
    },
    onClose: () => {
      toast.show({ title: 'Closed', description: 'User closed form' });
    },
  });

  return {
    render: debounce(component.render, 1000),
    destroy: component.destroy,
  };
};

const DemoForm = ({ authToken }: DemoFormProps) => {
  const router = useRouter();
  const { appUrl } = getFormArgs(getQueryArgs(router));
  const [ref, setRef] = React.useState<FootprintFormRef | undefined>();
  const [isCustomSaveLoading, setIsCustomSaveLoading] = useState(false);
  const toast = useToast();
  const form = formSetup(authToken, setRef, toast);

  useEffect(() => {
    form.render(appUrl);
    return () => {
      form.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = () => {
    setIsCustomSaveLoading(true);
    ref
      ?.save()
      .then(() => {
        toast.show({
          title: 'Success',
          description: 'Successfully saved via ref',
        });
      })
      .catch((error: string) => {
        console.error(error);
        toast.show({
          title: 'Error',
          description: error,
          variant: 'error',
        });
      })
      .finally(() => {
        setIsCustomSaveLoading(false);
      });
  };

  return (
    <>
      <div className="w-full h-full max-w-[700px]" id="footprint-secure-form" />

      <Button variant="secondary" onClick={handleClick} loading={isCustomSaveLoading}>
        Custom Save via Ref
      </Button>
    </>
  );
};

export default DemoForm;
