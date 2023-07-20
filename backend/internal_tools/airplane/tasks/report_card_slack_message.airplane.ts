import airplane from 'airplane';

const task = async params => {
  const fmtDataIdentifier = di => {
    return `• \`${di.kind}\`: ${di.count}`;
  };
  const fmtTenant = tenant => {
    const header = `*${tenant.name}* (<https://dashboard.onefootprint.com/assume?tenantId=${tenant.tenant_id}|assume>)`;
    const keysInUse = (tenant.all_keys || []).map(k => `\`${k}\``).join(', ');
    return [
      header,
      `• num scoped users: ${tenant.num_scoped_vaults || 0}`,
      `• max number of keys on one user: ${tenant.max_keys_per_user || 0}`,
      `• num proxy requests: ${tenant.num_proxy_requests || 0}`,
      `• num keys in use: ${tenant.count_keys || 0}`,
      `• keys in use: ${keysInUse}`,
    ].join('\n');
  };
  const dataIdentifiers = JSON.parse(params.data_identifiers_json);
  const perTenantStats = JSON.parse(params.per_tenant_stats_json);
  const message = [
    `Report card for *${new Date().toLocaleString()}*`,
    '\n',
    `:penguin-reclined: :penguin-reclined: :penguin-reclined: *All data identifiers in use:* :penguin-reclined: :penguin-reclined: :penguin-reclined:`,
    dataIdentifiers.map(fmtDataIdentifier).join('\n'),
    '\n',
    `:penguin-reclined: :penguin-reclined: :penguin-reclined: *Live tenants:* :penguin-reclined: :penguin-reclined: :penguin-reclined:`,
    '\n',
    perTenantStats.map(fmtTenant).join('\n\n\n'),
  ].join('\n');
  airplane.slack.message('daily-report-card', message);
};

export default airplane.task(
  {
    slug: 'report_card_slack_message',
    name: 'Send slack message',
    description: 'Composes a slack message with stats from report card queries',
    parameters: {
      data_identifiers_json: {
        type: 'longtext',
        name: 'Data identifiers (JSON)',
      },
      per_tenant_stats_json: {
        type: 'longtext',
        name: 'Per-tenant stats (JSON)',
      },
    },
  },
  task,
);
