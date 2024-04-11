/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Project, TextFile } from "projen";
import { JavaProjectOptions } from "projen/lib/java";
import { JestOptions, NodePackageManager } from "projen/lib/javascript";
import {
  TypeScriptProject,
  TypeScriptProjectOptions,
} from "projen/lib/typescript";
import { LICENSE, getHeaderLicense, getLongLicense } from "./license";

const JEST_OPTIONS: JestOptions = {
  jestConfig: {
    // transform: {
    //   "\\.[jt]sx?$": ["ts-jest", { tsconfig: "tsconfig.dev.json" }],
    // },
  },
};

export const PACKAGE_MANAGER: NodePackageManager = NodePackageManager.PNPM;

export const COMMON_TS_PROJECT_OPTIONS = {
  // Overridden with ASL
  defaultReleaseBranch: "mainline",
  eslint: true,
  jestOptions: JEST_OPTIONS,
  licensed: false,
  minNodeVersion: "18.19.0",
  packageManager: PACKAGE_MANAGER,
  tsconfig: {
    compilerOptions: {
      lib: ["es2020", "dom"],
      skipLibCheck: true,
    },
  },
} satisfies Partial<TypeScriptProjectOptions>;

export const COMMON_JAVA_PROJECT_OPTIONS = {
  groupId: "aws.proto.routeoptimizationaccelerator",
  packaging: "jar",
} satisfies Partial<JavaProjectOptions>;

export const CDK_VERSION = "2.133.0";
export const PDK_VERSION = "0.23.10";

export const COMMON_CDK_DEPS = [
  `aws-cdk-lib@${CDK_VERSION}`,
  "constructs",
  "cdk-iam-actions",
  "cdk-nag",
];

export const ESLINT_HEADER_RULE = {
  "header/header": [2, "block", getHeaderLicense()],
};

export const configureProject = (project: Project) => {
  licenseFile(project);

  if (project instanceof TypeScriptProject) {
    project.tryFindObjectFile("package.json")?.addOverride("license", LICENSE);
  }
};

/**
 * Add a LICENSE file to a project
 */
export const licenseFile = (project: Project) => {
  new TextFile(project, "LICENSE", { lines: getLongLicense() });
};
