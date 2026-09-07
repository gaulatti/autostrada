import { Stack } from 'aws-cdk-lib';
import { CfnAccessKey, User } from 'aws-cdk-lib/aws-iam';

const createGitHubActionsPermissions = (stack: Stack) => {
  /**
   * Create an IAM user for Github Actions
   */
  const githubActionsUser = new User(stack, `${stack.stackName}GithubActionsUser`, {
    userName: `${stack.stackName.toLowerCase()}-github-actions-user`,
  });

  /**
   * Create an access key for the IAM user
   */
  const accessKey = new CfnAccessKey(stack, `${stack.stackName}GithubActionsAccessKey`, {
    userName: githubActionsUser.userName,
  });

  return { githubActionsUser };
};

export { createGitHubActionsPermissions };
