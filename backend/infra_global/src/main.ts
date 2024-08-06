import * as aws from '@pulumi/aws';
import * as util from './util';
import * as pulumi from '@pulumi/pulumi';
import * as github from '@pulumi/github';

export default async function main() {
  const config = new pulumi.Config();

  const user = createPulumiCiCdUser();

  // create user for this role
  const userKey = new aws.iam.AccessKey(`pulumi-cicd-user-key`, {
    user: user.name,
  });

  // publish the token to github
  const githubEnv = config.get('githubActionsSecretEnv')!;

  const _ghAccessKeyId = new github.ActionsEnvironmentSecret(`gh-pulumi-cicd_keyid-${githubEnv}`, {
    secretName: 'AWS_ACCESS_KEY_ID_ALT',
    environment: githubEnv,
    repository: 'monorepo',
    plaintextValue: userKey.id,
  });

  const _ghAccessKeySecret = new github.ActionsEnvironmentSecret(`gh-pulumi-cicd-secretkey${githubEnv}`, {
    secretName: 'AWS_SECRET_ACCESS_KEY_ALT',
    environment: githubEnv,
    repository: 'monorepo',
    plaintextValue: userKey.secret,
  });
}

/// Create a role for Pulumi CI/CD to use
function createPulumiCiCdUser(): aws.iam.User {
  const user = new aws.iam.User(`pulumi-cicd-user`, {});

  // attach policies from disk
  const policyFiles = util.loadContentFiles('./pulumi_iam_policy');
  for (const policyContents of policyFiles) {
    const policy = new aws.iam.Policy(`pulumi-cicd-role-policy-${policyContents.name}`, {
      policy: policyContents.contents,
    });

    const _att = new aws.iam.PolicyAttachment(`pulumi-cicd-role-policy-att-${policyContents.name}`, {
      policyArn: policy.arn,
      users: [user.name],
    });
  }

  return user;
}
