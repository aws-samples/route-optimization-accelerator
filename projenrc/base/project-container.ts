/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { TypeScriptProject } from "projen/lib/typescript";
import { MonorepoProject } from "./monorepo-project";

export interface ProjectContainerProps {
  /**
   * The monorepo project reference to contain instantiated packages.
   */
  readonly monorepoProject: MonorepoProject;

  /**
   * The name of the main release branch.
   * @default main
   */
  readonly defaultReleaseBranch?: string;

  /**
   * TODO: is this needed?
   */
  readonly eslint?: boolean;

  /**
   * Shared dependencies for all the projects contained in the container.
   */
  readonly deps: Record<string, TypeScriptProject>;

  /**
   * The package namespace if you want to override the monorepoProject's ns.
   */
  readonly packageNamespace?: string;
}

/**
 * Base class for a project container, which represents a logical separation
 * to instantiating packages.
 */
export class ProjectContainer {
  protected readonly monorepoProject: MonorepoProject;
  protected readonly defaultReleaseBranch: string;
  protected readonly eslint: boolean;
  public readonly packageNamespace: string;

  constructor(props: ProjectContainerProps) {
    this.monorepoProject = props.monorepoProject;
    this.defaultReleaseBranch = props.defaultReleaseBranch ?? "main";
    this.eslint = props.eslint ?? false;
    this.packageNamespace =
      props.packageNamespace ?? props.monorepoProject.packageNamespace;
  }
}
