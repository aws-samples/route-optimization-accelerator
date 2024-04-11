## Getting started

In order to deploy the solution in your AWS Account make sure that your build environment has the following tools installed:

- [AWS CLI V2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) - [configured with a profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
- [NodeJS](https://nodejs.org/en/download) >=18
- [OpenJDK - Corretto 17](https://docs.aws.amazon.com/corretto/latest/corretto-17-ug/downloads-list.html)
- [Maven](https://maven.apache.org/download.cgi)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/engine/install/)

## Init

After the required tools are installed correctly, run the following **from the repo root folder** and make sure to have Docker running on your machine:

```sh
$ pnpm install
```

Before running the build, make sure you're logged into the [Amazon ECR Public Gallery](https://docs.aws.amazon.com/AmazonECR/latest/public/public-registries.html), which is where the base container image is hosted:

```sh
aws ecr-public get-login-password --region us-east-1 --profile [profile] | docker login --username AWS --password-stdin public.ecr.aws
```

> **note**: change the [profile] with the one configured in your machine

then build the project:

```sh
$ pnpm run build
```

## Configure

The application has a set of default settings that can be changed before deploying it into your AWS Account. Navigate to the [./src/utils//default-settings.ts](./src/utils/default-settings.ts) to apply the changes you'd like before deploying it.

## Deploy

to deploy the project, move into the `packages/infra-app` folder (where this README is located) and run the following commands:

`[Optional]`: If you haven't done the [CDK bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) of your AWS Account yet, run the following commands (needed only once, in the region where you want to deploy it):

```sh
pnpm pdk bootstrap --profile [profile]
```

> **note**: change the [profile] with the one configured in your machine

then deploy it with:

```sh
pnpm pdk deploy --parameters AdminUserEmail=admin@an-email-domain.com --parameters AdminUserName=admin --profile [profile]
```

> **note**: change the [profile] with the one configured in your machine, and the values of `AdminUserEmail` and `AdminUserName`. You can append `--require-approval=never` to avoid providing approval

once deployed, you will receive an email to the specified account with the password to use to access the Web UI
