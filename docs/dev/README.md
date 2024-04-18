# Developer guide

This project is based on PDK and additional tools linked below. It's advised to familiarise with them before diving too deep in the source code:

- [AWS PDK](https://github.com/aws/aws-pdk)
  - [projen](https://github.com/projen/projen)
  - [Smithy](https://smithy.io/2.0/index.html)
  - [CDK](https://github.com/aws/aws-cdk)
  - [Nx](https://nx.dev/)

## Project definition

Any change to the project structure, dependencies and/or their configuration must be applied in the code by changing the projen files defined by this accelerator. The entry point is the [.projenrc](../../.projenrc.ts) file located in the root folder which referes to classes that are located in the [projenrc](../../projenrc/) folder.

Any change to the project structure requires you to run `pnpm projen` from the root folder to apply the changes.

## API Definition

Any change to the API definition (payload, structure) must be applied to the [Web API Service](../../packages/api/web-api-service/README.md) package using [Smithy model](../../packages/api/web-api-service/model/src/main/smithy/main.smithy), which leverages [typesafe API from PDK](https://aws.github.io/aws-pdk/developer_guides/type-safe-api/getting_started.html) to generates documentation and runtime to be used in the application.

## Optimization Engine

To apply changes to the optimization engine it's advised to refer to the [timefold documentation](https://docs.timefold.ai/timefold-solver/latest/introduction/introduction). This accelerator uses the linear optimization solver library as foundation to build the optimization engine.

## Infra

The infrastructure (IaC) is done with CDK and the entry point is the [infra-app main file](../../packages/infra-app/src/main.ts). This project includes other packages (e.g. API, optimization engine, routing etc.) as dependencies and deploy altogether in your AWS Account.

Instructions on the deployment can be found in the [infra-app README file](../../packages/infra-app/README.md)
