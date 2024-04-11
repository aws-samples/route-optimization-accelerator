/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { MonorepoProject } from "./projenrc/base/monorepo-project";
import { APIProjectContainer } from "./projenrc/projects/api";
import { InfraAppProjectContainer } from "./projenrc/projects/infra-app";
import { InfraCommonProjectContainer } from "./projenrc/projects/infra-common";
import { RouteOptimizationProjectContainer } from "./projenrc/projects/route-optimization";
import { WebUIProjectContatiner } from "./projenrc/projects/web-ui";

const monorepoProject = new MonorepoProject();

const infraCommon = new InfraCommonProjectContainer({
  monorepoProject,
  deps: {},
});

const routeOptimization = new RouteOptimizationProjectContainer({
  monorepoProject,
  deps: {
    infraCommon: infraCommon.commonPackage,
  },
});

const apiProject = new APIProjectContainer({
  monorepoProject,
  deps: {
    infraCommon: infraCommon.commonPackage,
    optimizationInfra: routeOptimization.optimizationInfra,
  },
});

const webUI = new WebUIProjectContatiner({
  monorepoProject,
  webApiService: apiProject.webApiService,
  deps: {
    webApi: apiProject.webApi,
  },
});

new InfraAppProjectContainer({
  monorepoProject,
  deps: {
    infraCommon: infraCommon.commonPackage,
    routingEngine: routeOptimization.routingEngine,
    optimizationInfra: routeOptimization.optimizationInfra,
    webApi: apiProject.webApi,
    webUI: webUI.webSite,
  },
});

monorepoProject.addImplicitDependency(
  routeOptimization.optimizationInfra,
  routeOptimization.optimizationEngine,
);

monorepoProject.synth();
