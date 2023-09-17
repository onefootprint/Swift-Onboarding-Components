import airplane from 'airplane';

const task = async params => {
  const stuckUsersJson = JSON.parse(params.stuck_users);
  if (!stuckUsersJson) {
    return;
  }
  const fmtUser = u =>
    `${u.tenant_name} \`${u.fp_id}\` in \`${u.workflow_status}\`: State: \`${u.workflow_state}\` Created \`${u.created_at}\`, Authorized: ${u.is_authorized}, Decision: ${u.is_decision_made}`;
  const stuckUsers = stuckUsersJson
    .map(u => {
      return [`• `, fmtUser(u)].join('');
    })
    .join('\n');
  const message = `Stuck users:\n\n${stuckUsers}`;
  airplane.slack.message('elliott-stuck-users', message);
};

export default airplane.task(
  {
    slug: 'stuck_users_slack_message',
    name: 'Send slack message',
    description: 'Composes a slack message with stuck users',
    parameters: {
      stuck_users: {
        type: 'longtext',
        name: 'Stuck users (JSON)',
      },
    },
  },
  task,
);
