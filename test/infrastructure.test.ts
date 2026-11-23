import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AutostradaStack } from '../lib';

const synthesize = () => {
  process.env.HOSTED_ZONE_ID = 'Z0000000000000';
  process.env.HOSTED_ZONE_NAME = 'example.invalid';
  process.env.HOSTED_ZONE_CERTIFICATE = 'arn:aws:acm:us-east-1:111111111111:certificate/00000000-0000-0000-0000-000000000000';
  process.env.SERVICE_ROLE_ARN = 'arn:aws:iam::111111111111:role/autostrada-service';

  const app = new cdk.App();
  return Template.fromStack(new AutostradaStack(app, 'Autostrada'));
};

test('does not expose deployment credentials through stack outputs', () => {
  const template = synthesize().toJSON();
  const outputs = JSON.stringify(template.Outputs ?? {});

  expect(outputs).not.toContain('AutostradaGithubActionsAccessKey');
  expect(outputs).not.toContain('SecretAccessKey');
});
