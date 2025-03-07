/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CloudscapeReactTsWebsiteProject } from "@aws/pdk/cloudscape-react-ts-website";
import { TypeSafeApiProject } from "@aws/pdk/type-safe-api";
import {
  ProjectContainer,
  ProjectContainerProps,
} from "../base/project-container";
import {
  COMMON_TS_PROJECT_OPTIONS,
  ESLINT_HEADER_RULE,
  configureProject,
} from "../util/config";

export interface WebUIProjectContatinerProps extends ProjectContainerProps {
  webApiService: TypeSafeApiProject;
}

export class WebUIProjectContatiner extends ProjectContainer {
  public readonly webSite: CloudscapeReactTsWebsiteProject;

  constructor(props: WebUIProjectContatinerProps) {
    super(props);

    const webSite = new CloudscapeReactTsWebsiteProject({
      ...COMMON_TS_PROJECT_OPTIONS,
      applicationName: "Route Optimization Accelerator",
      deps: [
        "dayjs",
        "@tanstack/react-query",
        "uuid",
        "maplibre-gl",
        "@aws/amazon-location-utilities-auth-helper@1.2.1",
        "react-top-loading-bar",

        "@aws-sdk/types",
        "@aws-sdk/client-location",
        "@aws-sdk/client-cognito-identity",
        "@aws-sdk/client-cognito-identity-provider",
        "@aws-sdk/credential-provider-cognito-identity",

        "@cloudscape-design/collection-hooks",
        "@cloudscape-design/components",
        "@cloudscape-design/code-view",
        "@cloudscape-design/global-styles",
        "aws4fetch",
        "pretty-bytes",
        "@turf/turf",
        "@mapbox/polyline",
        "ace-builds",

        props.webApiService.library.typescriptReactQueryHooks!.package
          .packageName,
      ],
      devDeps: ["@types/uuid", "@types/mapbox__polyline", "@types/react-csv"],
      name: `${this.packageNamespace}/web-ui`,
      outdir: `packages/web-ui`,
      parent: this.monorepoProject,
      tsconfigDev: {
        compilerOptions: {
          rootDir: "src",
        },
        include: ["src/**/*.tsx", "test/**/*.tsx"],
      },
      typescriptVersion: "latest",
    });
    webSite.tasks.addEnvironment("GENERATE_SOURCEMAP", "false");
    // Ensure the production bundle can render maps correctly
    // https://docs.mapbox.com/mapbox-gl-js/guides/install/#targeting-transpilation-to-es6-with-browserslist
    webSite.package.addField("browserslist", {
      production: [
        ">0.2%",
        "not dead",
        "not op_mini all",
        "not safari < 10",
        "not chrome < 51",
        "not android < 5",
        "not ie < 12",
      ],
      development: [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version",
      ],
    });
    webSite.eslint?.addPlugins("header");
    webSite.eslint?.addRules(ESLINT_HEADER_RULE);
    webSite.testTask.reset(
      "react-scripts test --watchAll=false --passWithNoTests",
    );
    webSite.addTask("devDebug", {
      exec: "BROWSER='google chrome' BROWSER_ARGS='--remote-debugging-port=9222' react-scripts start",
    });
    webSite.tryFindObjectFile("package.json")?.addOverride("pnpm", {
      overrides: {
        "nth-check": "^2.0.1",
        "webpack-dev-middleware": "^5.3.4",
      },
    });
    configureProject(webSite);

    this.webSite = webSite;
  }
}
