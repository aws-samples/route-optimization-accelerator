/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { JavaProject } from "projen/lib/java";
import { TypeScriptProject } from "projen/lib/typescript";
import {
  ProjectContainer,
  ProjectContainerProps,
} from "../base/project-container";
import {
  COMMON_CDK_DEPS,
  COMMON_JAVA_PROJECT_OPTIONS,
  COMMON_TS_PROJECT_OPTIONS,
  configureProject,
} from "../util/config";

export interface RouteOptimizationProjectContainerProps
  extends ProjectContainerProps {}

const OUTDIR_BASE = "packages/route-optimization";

/**
 * Package definitions for RouteOptimization Engine and infra
 */
export class RouteOptimizationProjectContainer extends ProjectContainer {
  public readonly optimizationEngine: JavaProject;
  public readonly optimizationInfra: TypeScriptProject;
  public readonly routingEngine: TypeScriptProject;

  constructor(props: RouteOptimizationProjectContainerProps) {
    super(props);

    const packageName = COMMON_JAVA_PROJECT_OPTIONS.groupId;
    const artifactId = "OptimizationEngine";
    const optimizationPackagePath = `${packageName
      .split(".")
      .join("/")}/${artifactId}`;
    const optimizationEngine = new JavaProject({
      ...COMMON_JAVA_PROJECT_OPTIONS,
      artifactId,
      deps: [
        "software.amazon.awssdk/utils@2.23.12",
        "software.amazon.awssdk/sqs@2.23.12",
        "software.amazon.awssdk/location@2.23.12",
        "software.amazon.awssdk/secretsmanager@2.23.12",
        "software.amazon.awssdk/ssm@2.23.12",
        "software.amazon.awssdk/eventbridge@2.23.12",
        "software.amazon.awssdk/aws-json-protocol@2.23.12",
        "software.amazon.awssdk/protocol-core@2.23.12",
        "com.fasterxml.jackson.core/jackson-databind@2.15.2",
        "com.fasterxml.jackson.datatype/jackson-datatype-jsr310@2.16.1",
        "org.apache.logging.log4j/log4j-api@2.22.1",
        "org.apache.logging.log4j/log4j-core@2.22.1",
        "org.apache.logging.log4j/log4j-slf4j2-impl@2.22.1",
        "org.apache.commons/commons-math3@3.6.1",
        "org.apache.commons/commons-lang3@3.13.0",
        "org.apache.commons/commons-collections4@4.4",
        "ai.timefold.solver/timefold-solver-core@1.9.0",
        "ai.timefold.solver/timefold-solver-core-impl@1.8.1",
        "ai.timefold.solver/timefold-solver-constraint-streams@1.8.1",
        // "ai.timefold.solver/timefold-solver-constraint-streams-common@1.9.0",
        // "ai.timefold.solver/timefold-solver-constraint-streams-bavet@1.9.0",
        "ai.timefold.solver/timefold-solver-jackson@1.9.0",
      ],
      name: `${this.packageNamespace}/optimization-engine`,
      outdir: `${OUTDIR_BASE}/optimization-engine`,
      version: "1.0.0",
      parent: this.monorepoProject,
      sampleJavaPackage: packageName,
      compileOptions: {
        // corretto 17
        source: "17",
        target: "17",
      },
    });
    optimizationEngine
      .tryFindObjectFile("pom.xml")
      ?.addToArray("project.dependencies.dependency", [
        {
          groupId: "org.projectlombok",
          artifactId: "lombok",
          version: "1.18.30",
          scope: "provided",
        },
      ]);
    optimizationEngine.packageTask.exec(
      `cp -r src/docker/* dist/java/${optimizationPackagePath}`,
    );
    // assemble everything
    optimizationEngine
      .tryFindObjectFile("pom.xml")
      ?.addToArray("project.build.plugins.plugin", [
        {
          groupId: "org.apache.maven.plugins",
          artifactId: "maven-assembly-plugin",
          version: "3.6.0",
          executions: {
            execution: {
              phase: "package",
              goals: {
                goal: "single",
              },
            },
          },
          configuration: {
            archive: {
              manifest: {
                mainClass: `${packageName}.${artifactId}`,
              },
            },
            descriptorRefs: {
              descriptorRef: "jar-with-dependencies",
            },
          },
        },
        {
          groupId: "org.apache.maven.plugins",
          artifactId: "maven-surefire-plugin",
          version: "3.1.2",
          configuration: {
            argLine: "--illegal-access=permit",
          },
        },
      ]);
    optimizationEngine.gitignore.addPatterns(".idea/*");
    optimizationEngine.gitignore.addPatterns("!.idea/copyright");
    configureProject(optimizationEngine);

    const routingEngine = new TypeScriptProject({
      ...COMMON_TS_PROJECT_OPTIONS,
      deps: [
        ...COMMON_CDK_DEPS,
        ...Object.values(props.deps).map((d) => d.package.packageName),
      ],
      devDeps: [],
      name: `${this.packageNamespace}/routing-engine`,
      outdir: `${OUTDIR_BASE}/routing-engine`,
      parent: this.monorepoProject,
    });
    configureProject(routingEngine);

    const optimizationInfra = new TypeScriptProject({
      ...COMMON_TS_PROJECT_OPTIONS,
      deps: [
        ...COMMON_CDK_DEPS,
        "@aws-sdk/client-sqs",
        "uuid",
        "dayjs",

        ...Object.values(props.deps).map((d) => d.package.packageName),
      ],
      devDeps: ["@types/uuid", "@types/aws-lambda"],
      name: `${this.packageNamespace}/optimization-infra`,
      outdir: `${OUTDIR_BASE}/optimization-infra`,
      parent: this.monorepoProject,
    });
    optimizationInfra.packageTask.exec(
      `mkdir -p optimization-engine-build && cp -r ../optimization-engine/dist/java/${optimizationPackagePath}/* optimization-engine-build`,
    );
    optimizationInfra.gitignore.addPatterns("optimization-engine-build/");
    configureProject(optimizationInfra);

    this.optimizationEngine = optimizationEngine;
    this.optimizationInfra = optimizationInfra;
    this.routingEngine = routingEngine;
  }
}
