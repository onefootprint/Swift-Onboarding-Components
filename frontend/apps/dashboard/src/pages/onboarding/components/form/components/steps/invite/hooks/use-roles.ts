import { useTranslation } from '@onefootprint/hooks';

const useRoles = () => {
  const { t } = useTranslation('pages.onboarding.invite.form.role');
  const roles = [
    { value: 'member', label: t('options.member') },
    { value: 'developer', label: t('options.developer') },
    { value: 'admin', label: t('options.admin') },
  ];
  const [defaultRole] = roles;

  return {
    defaultRole,
    roles,
  };
};

export default useRoles;
