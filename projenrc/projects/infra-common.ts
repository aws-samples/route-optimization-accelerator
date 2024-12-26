/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { TypeScriptProject } from "projen/lib/typescript";
import {
  ProjectContainer,
  ProjectContainerProps,
} from "../base/project-container";
import {
  COMMON_CDK_DEPS,
  COMMON_TS_PROJECT_OPTIONS,
  configureProject,
} from "../util/config";

const OUTDIR_BASE = "packages";

export interface InfraCommonProjectContainerProps
  extends ProjectContainerProps {}

/**
 * Package definitions for IoT device onboarding and provisioning.
 */
export class InfraCommonProjectContainer extends ProjectContainer {
  public readonly commonPackage: TypeScriptProject;

  constructor(props: InfraCommonProjectContainerProps) {
    super(props);

    this.commonPackage = new TypeScriptProject({
      ...COMMON_TS_PROJECT_OPTIONS,
      deps: [
        ...COMMON_CDK_DEPS,
        ...Object.values(props.deps).map((d) => d.package.packageName),
      ],
      devDeps: [],
      name: `${this.packageNamespace}/infra-common`,
      outdir: `${OUTDIR_BASE}/infra-common`,
      parent: this.monorepoProject,
    });

    configureProject(this.commonPackage);
  }
}
