import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { ProxyConfigDetails } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React, { useId, useState } from 'react';
import { Fieldset } from 'src/components';

import useUpdateProxyConfigs from '@/proxy-configs/hooks/use-update-proxy-configs';
import type { FormData } from '@/proxy-configs/proxy-configs.types';

import { createPayload, getDefaultValues } from './utils';

export type EditProps = {
  proxyConfig: ProxyConfigDetails;
  title: string;
  children: React.ReactNode;
  Form: ({ id, onSubmit, values }: any) => JSX.Element;
};

const Edit = ({ proxyConfig, children, title, Form }: EditProps) => {
  const id = useId();
  const { allT } = useTranslation();
  const [show, setShow] = useState(false);
  const proxyConfigMutation = useUpdateProxyConfigs();
  const showErrorToast = useRequestErrorToast();

  const handleSubmit = (formData: FormData) => {
    const payload = createPayload(proxyConfig.id, formData);
    proxyConfigMutation.mutate(payload, {
      onError: showErrorToast,
      onSuccess: () => setShow(false),
    });
  };

  return show ? (
    <>
      <Form
        onSubmit={handleSubmit}
        id={id}
        values={getDefaultValues(proxyConfig)}
      />
      <FormActions>
        <Button
          disabled={proxyConfigMutation.isLoading}
          onClick={() => setShow(false)}
          size="small"
          variant="secondary"
        >
          {allT('cancel')}
        </Button>
        <Button
          form={id}
          loading={proxyConfigMutation.isLoading}
          size="small"
          type="submit"
        >
          {allT('save')}
        </Button>
      </FormActions>
    </>
  ) : (
    <Fieldset
      title={title}
      // TODO: editing of vault proxy configs is pretty broken right now, and we're not convinced
      // we need it. For now, let's stop allowing editing at all - will revisit in the future as
      // more customers start using it
      // cta={{
      //   label: allT('edit'),
      //   onClick: () => setShow(true),
      // }}
    >
      {children}
    </Fieldset>
  );
};

const FormActions = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    justify-content: flex-end;
    margin-bottom: ${theme.spacing[8]};
    margin-top: ${theme.spacing[6]};
  `}
`;

export default Edit;
