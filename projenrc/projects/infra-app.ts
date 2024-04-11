/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { InfrastructureTsProject } from "@aws/pdk/infrastructure";
import {
  ProjectContainer,
  ProjectContainerProps,
} from "../base/project-container";
import {
  CDK_VERSION,
  COMMON_CDK_DEPS,
  COMMON_TS_PROJECT_OPTIONS,
  configureProject,
} from "../util/config";

const OUTDIR_BASE = "packages";

export interface InfraAppProjectContainerProps extends ProjectContainerProps {}

export class InfraAppProjectContainer extends ProjectContainer {
  public readonly infraApp: InfrastructureTsProject;

  constructor(props: InfraAppProjectContainerProps) {
    super(props);

    const infraApp = new InfrastructureTsProject({
      ...COMMON_TS_PROJECT_OPTIONS,
      authorEmail: "",
      authorName: "",
      cdkVersion: CDK_VERSION,
      deps: [
        ...COMMON_CDK_DEPS,
        "@aws-cdk/aws-cognito-identitypool-alpha",
        "config",
        "find-up@^5.0.0",
        "lodash",
        "uuid",
        "dotenv",

        ...Object.values(props.deps).map((d) => d.package.packageName),
      ],
      devDeps: ["@types/lodash"],
      gitignore: [],
      name: `${this.packageNamespace}/infra`,
      outdir: `${OUTDIR_BASE}/infra-app`,
      parent: this.monorepoProject,
    });
    configureProject(infraApp);

    infraApp.package.addPackageResolutions("find-up@^5.0.0");

    infraApp.gitignore.addPatterns("cdk.context.json");

    infraApp.addTask("bootstrap", {
      exec: "cdk bootstrap",
      receiveArgs: true,
    });

    infraApp
      .tryFindObjectFile("cdk.json")
      ?.addOverride("context.@aws-cdk/aws-s3:createDefaultLoggingPolicy", true);

    this.infraApp = infraApp;
  }
}
