# Autostrada Infrastructure

This project contains the AWS Cloud Development Kit (CDK) code for provisioning and managing the AWS infrastructure resources required by the Autostrada web performance monitoring platform. The infrastructure is defined as code using TypeScript and the AWS CDK framework.

## Overview

The Autostrada infrastructure stack deploys and configures the following AWS resources:

- **Compute Resources**:
  - ECS Fargate clusters for running containerized services
  - Lambda functions for serverless processing of scan data

- **Data Storage**:
  - RDS PostgreSQL database for storing performance metrics and user data
  - S3 buckets for storing Lighthouse reports and other assets
  - DynamoDB tables for feature flags and configuration

- **Authentication & Security**:
  - Cognito User Pools for user authentication and management
  - IAM roles and policies with least privilege principles
  - Security groups and network ACLs for securing resources

- **Networking**:
  - VPC with public and private subnets
  - Application Load Balancers for distributing traffic
  - API Gateway for REST API endpoints

- **Monitoring & Logging**:
  - CloudWatch alarms and dashboards
  - CloudTrail for API activity logging
  - X-Ray for distributed tracing

## Prerequisites

Before deploying this stack, ensure you have:

1. **AWS CLI** configured with appropriate credentials
2. **Node.js** (version 14.x or later) installed
3. **AWS CDK Toolkit** installed globally (`npm install -g aws-cdk`)
4. Bootstrapped your AWS environment (`cdk bootstrap aws://ACCOUNT-NUMBER/REGION`)

## Installation

To set up the project locally:

```bash
# Clone the repository
git clone https://github.com/gaulatti/autostrada.git
cd autostrada/infrastructure

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the project root with the following environment variables:

```
# AWS Configuration
CDK_DEFAULT_ACCOUNT=your-aws-account-id
CDK_DEFAULT_REGION=your-aws-region

# Database Configuration
DB_INSTANCE_TYPE=db.t3.small
DB_STORAGE_GB=20
DB_NAME=autostrada

# Service Configuration
SERVICE_DESIRED_COUNT=2
SERVICE_CPU=256
SERVICE_MEMORY_LIMIT=512

# Domain and Certificates
DOMAIN_NAME=example.com
CERTIFICATE_ARN=arn:aws:acm:region:account:certificate/certificate-id
```

## Deployment

To deploy the infrastructure:

```bash
# Synthesize CloudFormation template
npm run build
cdk synth

# Deploy to AWS
cdk deploy --all
```

For more granular deployments, you can specify individual stacks:

```bash
cdk deploy AutostradaNetworkStack
cdk deploy AutostradaServiceStack
```

## Stacks

The infrastructure is organized into multiple stacks:

1. **NetworkStack**: VPC, subnets, security groups, and network ACLs
2. **DatabaseStack**: RDS PostgreSQL instance and related resources
3. **StorageStack**: S3 buckets and DynamoDB tables
4. **AuthStack**: Cognito User Pools and Identity Pools
5. **ServiceStack**: ECS services, Load Balancers, and API Gateway
6. **MonitoringStack**: CloudWatch alarms and dashboards

## CI/CD Integration

The infrastructure supports CI/CD pipelines through CodePipeline. For manual deployments, follow these steps:

1. Create a feature branch from main
2. Make your infrastructure changes
3. Run `cdk diff` to review changes before deployment
4. Submit a pull request for review
5. Once approved, changes will be deployed automatically via CI/CD

## Useful Commands

* `npm run build`   compile TypeScript to JavaScript
* `npm run watch`   watch for changes and compile
* `npm run test`    perform Jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emit the synthesized CloudFormation template
* `cdk destroy`     tear down the deployed stack (use with caution)

## Common Operations

### Updating RDS Database Parameters

To update the RDS database parameters, modify the `databaseStack.ts` file:

```typescript
const parameterGroup = new rds.ParameterGroup(this, 'ParameterGroup', {
  engine: rds.DatabaseInstanceEngine.postgres({
    version: rds.PostgresEngineVersion.VER_13,
  }),
  parameters: {
    'max_connections': '100',
    'shared_buffers': '256MB',
  },
});
```

### Scaling ECS Services

To adjust the number of running containers:

```typescript
const service = new ecs.FargateService(this, 'Service', {
  cluster,
  taskDefinition,
  desiredCount: 4, // Adjust this number to scale up or down
  // ...other properties
});
```

## Troubleshooting

If you encounter issues during deployment:

1. Check CloudFormation events in the AWS Console
2. Verify that your AWS credentials have sufficient permissions
3. Ensure that your region is bootstrapped for CDK
4. Check for any VPC limits or service quotas that might be exceeded

## Security

- All sensitive data is stored in AWS Secrets Manager
- IAM roles follow the principle of least privilege
- All data in transit and at rest is encrypted
- Security groups restrict traffic to only necessary ports

## Contributing

Please refer to the project's contribution guidelines before submitting pull requests. All infrastructure changes should include:

1. Updated tests that verify the expected behavior
2. Documentation updates for any new or modified resources
3. Validation that the changes comply with security best practices

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file in the repository.
