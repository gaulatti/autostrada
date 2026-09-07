# Autostrada infrastructure

> **Disposition (verified 2026-09-07): retained infrastructure owner.** This
> repository owns Autostrada's shared AWS CDK stack. It is not the application
> source repository and its current `main` is not approved for deployment until
> [issue #2](https://github.com/gaulatti/autostrada/issues/2) reconciles the live
> stack, source drift, and legacy deployment credential.

## Ownership contract

| Concern | Owner and contract |
| --- | --- |
| Accountable product owner | [@gaulatti](https://github.com/gaulatti) |
| Infrastructure source | This repository, `git@github.com:gaulatti/autostrada.git`, default branch `main` |
| Canonical maintainer checkout | `/Users/gaulatti/source/gaulatti/autostrada` (create a fresh checkout before authorized work; the 2026-09-07 audit found no pre-existing checkout) |
| Delivery target | AWS CloudFormation stack `Autostrada`, including the public CloudFront/S3 frontend surface and shared delivery permissions |
| Frontend source and delivery | [`gaulatti/autostrada-frontend`](https://github.com/gaulatti/autostrada-frontend); its ownership audit is [issue #19](https://github.com/gaulatti/autostrada-frontend/issues/19) |
| Service source and delivery | [`gaulatti/autostrada-service`](https://github.com/gaulatti/autostrada-service); its ownership audit is [issue #2](https://github.com/gaulatti/autostrada-service/issues/2) |
| Identity integration | [`gaulatti/macondo`](https://github.com/gaulatti/macondo) owns the Cognito callback/logout allow-list |
| Availability probe | [`gaulatti/milano`](https://github.com/gaulatti/milano) owns the HTTP probe for `https://autostrada.gaulatti.com` |
| Secrets and deployment identity | The Gaulatti AWS account owner and administrators of the two split repositories. Values must never be committed, logged, or copied into an issue or PR. |
| Next production work | [Issue #2](https://github.com/gaulatti/autostrada/issues/2), blocked on this audit merging plus explicit AWS deploy and credential-rotation authorization |

The retained boundary is intentionally narrow. This repository provisions
shared infrastructure; it does not own the frontend UI, NestJS service,
database, Cognito pool, on-premises container host, or portfolio monitoring.

## What current source declares

The single CDK stack in `lib/` declares:

- S3 buckets `autostrada-frontend` and `autostrada-assets`;
- one CloudFront distribution, origin access identity, cache policy, response
  headers policy, and the `autostrada` Route 53 CNAME;
- ECR repository `autostrada`;
- CloudWatch log groups `/services/autostrada` and
  `/n8n/plugin/autostrada`, each with seven-day retention;
- IAM user `autostrada-github-actions-user`, its legacy access-key resource,
  related least-scope bucket/ECR/invalidation policy, and role
  `AutostradaServiceRole`.

The access-key resource remains only because deleting or replacing a live
credential requires consumer coordination and explicit authorization. Source
must never publish its ID or secret as CloudFormation outputs; a test enforces
that boundary. Issue #2 owns the eventual migration and rotation.

## Delivery contract

### Local validation

Use a clean checkout of the exact reviewed commit:

```bash
npm ci
npm test -- --runInBand
npm run build
npm run cdk:synth -- Autostrada
```

Synthesis requires these environment variables, supplied by the authorized
operator and never committed:

- `HOSTED_ZONE_ID`
- `HOSTED_ZONE_NAME`
- `HOSTED_ZONE_CERTIFICATE`
- `SERVICE_ROLE_ARN`
- the standard CDK account/region context and AWS session credentials

### Production delivery

There is no infrastructure Actions workflow and no automatic deployment. Do
not deploy current `main` as a discovery step. After issue #2 is authorized,
the operator must first run and save a reviewed diff:

```bash
npm run build
npm run cdk:diff -- Autostrada
```

Only an explicitly approved change set may then use:

```bash
npm run deploy -- Autostrada
```

The deploy script deliberately does not bypass CDK approval checks. Stop if the
diff contains any unexplained deletion, replacement, IAM expansion, DNS change,
or credential mutation.

### Health proof

The infrastructure surface is not the same as application health:

- verify DNS and TLS for `autostrada.gaulatti.com`;
- verify CloudFront is enabled and its origin is `autostrada-frontend`;
- render the public URL in a clean browser, not only with `curl`;
- verify an application-owned API health route agreed by the service owner;
- verify the split repository release at its exact commit; and
- attach the CloudFormation stack status and approved change-set result.

On 2026-09-07, HTTPS returned the frontend shell with HTTP 200, but an isolated
headless Chrome render showed `403 Forbidden`. The API root redirected to a
YouTube URL, while common health/readiness paths returned 401. That is evidence
of reachable infrastructure, not a healthy application or a verified release.

### Recovery and rollback

No infrastructure rollback has been exercised. Before a production change,
capture the deployed template, exact source SHA, CloudFormation change set,
frontend object/version recovery method, and a post-change smoke-test plan.
Rollback means reverting the exact reviewed source change and applying another
reviewed change set under explicit authorization; never run `cdk destroy`.
Frontend rollback is owned by
[`autostrada-frontend#21`](https://github.com/gaulatti/autostrada-frontend/issues/21),
and service recovery remains with the service repository owner.

## Evidence snapshot — 2026-09-07

No deployment, stack update, DNS change, credential mutation, object write, or
archive action was performed during this audit.

| Surface checked | Result |
| --- | --- |
| Repository | Public and unarchived; default `main` at `9e8e8bdd71ecbff0eafa775e7ca77a882aa91ad6`, last meaningful change 2025-05-19 |
| GitHub delivery/control plane | No workflows, runs, environments, deployments, releases, tags, webhooks, deploy keys, repository variables/secrets, rulesets, or Pages site |
| GitHub security | Secret scanning and push protection enabled; zero visible secret-scanning alerts. Dependabot alerts are disabled and no code-scanning analysis exists. |
| Packages | `@autostrada/infrastructure` is absent from npm. GitHub Packages could not be enumerated because the audit token lacks `read:packages`. |
| Split frontend | `main` at `8f88f8b07c34a5ea5b4b88a96f720a03f48191eb`; one active push workflow, zero runs, three secret names and eight variables. Ready ownership PR: [`autostrada-frontend#20`](https://github.com/gaulatti/autostrada-frontend/pull/20). |
| Split service | `main` at `51298138b11d8f5767fa24e37ba541a5eefe3a51`; one active push workflow, zero runs, seventeen secret names and four variables. The workflow describes an ECR build plus SSH delivery to an on-premises host, but no GitHub run proves it. |
| CloudFormation | Stack `Autostrada` is `UPDATE_COMPLETE`, created 2025-03-20 and last updated 2025-04-04; drift status is `NOT_CHECKED`. Its processed template still contains two ECR repositories and the retired Wiphala log group, unlike current source. |
| Credential exposure | The live processed template has an `AWS::IAM::AccessKey` and credential-valued stack outputs. Values were deliberately not read into this document. Current source no longer emits those outputs; issue #2 owns authorized removal from the live stack and rotation. |
| CloudFront and S3 | Distribution is enabled/deployed, aliases `autostrada.gaulatti.com`, and uses `autostrada-frontend` as its origin. Both named S3 buckets are reachable read-only; sampled frontend objects were last modified 2025-05-25 and sampled asset reports 2025-03-25. |
| ECR | CloudFormation records repositories `autostrada` and `wiphala-plugin-autostrada`, but neither exists in the current registry. No ECR repository name containing `autostrada` was found. |
| Logs | `/services/autostrada` and `/wiphala/plugin/autostrada` exist with seven-day retention and zero retained bytes. Their latest visible event timestamps were 2025-10-20 and 2025-04-22 respectively. Source instead declares `/n8n/plugin/autostrada`, which is absent. |
| Other named AWS resources | The IAM user and service role exist. Name-filtered checks found no Autostrada RDS instance, ECS cluster, Lambda, API Gateway REST API, DynamoDB table, CloudWatch alarm, dashboard, or Secrets Manager secret. This is negative name-based evidence, not proof that the split service has no external dependency. |
| DNS and TLS | `autostrada.gaulatti.com` is a CNAME to the live CloudFront domain; `api.autostrada.gaulatti.com` is an A record to a non-AWS-hosted address. `service.autostrada.gaulatti.com` does not resolve. The wildcard certificate was valid at audit time. |
| Public frontend | HTTPS shell response 200 through CloudFront/S3; clean isolated Chrome render displayed application-owned `403 Forbidden`. HTTP redirects to HTTPS. |
| API | `/` returned 302 to YouTube; `/health`, `/ready`, `/readiness`, `/metrics`, `/api`, and `/swagger` returned 401. No unauthenticated canonical health contract was found. |
| Portfolio consumers | Source search found navigation links in `ariston-frontend` and `alcantara-frontend`, Cognito URLs in `macondo`, and an active HTTP target in `milano`. Other matches using `autostrada` as an art/theme name are not runtime dependencies. |

### Audit methods

- GitHub REST inventory for repository metadata, commits, pull requests,
  workflows/runs, releases, deployments, environments, secrets/variables
  metadata, hooks, deploy keys, rulesets, Pages, and security alerts.
- `rg` over `/Users/gaulatti/source` for repository names, hostnames, package
  identifiers, infrastructure names, imports, and documentation references.
- read-only Route 53, CloudFormation, CloudFront, S3, ECR, IAM, CloudWatch Logs,
  Secrets Manager, RDS, ECS, Lambda, API Gateway, DynamoDB, and CloudWatch
  metadata calls. No secret value or log body was requested.
- DNS, TLS, HTTP endpoint probes, and an isolated headless-browser render.
- read-only inspection of the current default branches and delivery workflows
  in both split repositories.

## Residual unknowns

- The live stack has not had a drift detection run, and its deployed source SHA
  is not recorded.
- The reason and owner for the live API redirect, authenticated routes, and
  on-premises backend container are unresolved pending the service audit.
- The consumers and rotation history of the legacy IAM access key are not
  visible from repository metadata.
- Neither split repository has a GitHub Actions run proving its documented
  deployment path; the frontend's first controlled release is still blocked.
- GitHub Packages and a tested infrastructure rollback remain unverified.
