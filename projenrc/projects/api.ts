/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  DocumentationFormat,
  Language,
  Library,
  ModelLanguage,
  TypeSafeApiProject,
} from "@aws/pdk/type-safe-api";
import { TypeScriptProject } from "projen/lib/typescript";
import {
  ProjectContainer,
  ProjectContainerProps,
} from "../base/project-container";
import { awsSdkDepsAdminWebApi } from "../util/aws-sdk-deps";
import {
  COMMON_CDK_DEPS,
  COMMON_TS_PROJECT_OPTIONS,
  PDK_VERSION,
  configureProject,
} from "../util/config";
import { COPYRIGHT_OWNER, LICENSE } from "../util/license";

const OUTDIR_BASE = "packages/api";

export interface APIProjectContainerProps extends ProjectContainerProps {}

export class APIProjectContainer extends ProjectContainer {
  public readonly webApi: TypeScriptProject;
  public readonly webApiService: TypeSafeApiProject;

  constructor(props: APIProjectContainerProps) {
    super(props);

    const webApiService = new TypeSafeApiProject({
      library: {
        libraries: [Library.TYPESCRIPT_REACT_QUERY_HOOKS],
        options: {
          typescriptReactQueryHooks: {
            license: LICENSE,
            copyrightOwner: COPYRIGHT_OWNER,
          },
        },
      },
      documentation: {
        formats: [DocumentationFormat.HTML_REDOC],
      },
      infrastructure: {
        language: Language.TYPESCRIPT,
        options: {
          typescript: {
            license: LICENSE,
            copyrightOwner: COPYRIGHT_OWNER,
          },
        },
      },
      model: {
        language: ModelLanguage.SMITHY,
        options: {
          smithy: {
            smithyBuildOptions: {
              projections: {
                openapi: {
                  plugins: {
                    openapi: {
                      // disable this as it creates a "format" field that is not supported by
                      // api gateway
                      useIntegerType: false,
                    },
                  },
                },
              },
            },
            serviceName: {
              namespace: "aws.proto.routeoptimizationaccelerator",
              serviceName: "WebApiService",
            },
          },
        },
      },
      name: `${this.packageNamespace}/web-api-service`,
      outdir: `${OUTDIR_BASE}/web-api-service`,
      parent: this.monorepoProject,
      runtime: {
        languages: [Language.TYPESCRIPT],
        options: {
          typescript: {
            defaultReleaseBranch:
              COMMON_TS_PROJECT_OPTIONS.defaultReleaseBranch,
            name: `${this.packageNamespace}/web-api-service-typescript-runtime`,
            peerDeps: [...COMMON_CDK_DEPS],
            devDeps: ["@types/node@^20"],
          },
        },
      },
    });
    configureProject(webApiService);
    webApiService.gitignore.exclude("/model/bin/");
    this.webApiService = webApiService;

    const webApi = new TypeScriptProject({
      ...COMMON_TS_PROJECT_OPTIONS,
      deps: [
        ...COMMON_CDK_DEPS,
        ...awsSdkDepsAdminWebApi,
        "@turf/turf",
        "@mapbox/polyline",
        `@aws/pdk@${PDK_VERSION}`,
        "dayjs",
        "jwk-to-pem",
        "jsonwebtoken",
        "uuid",

        webApiService.runtime.typescript!.package.packageName,
        webApiService.infrastructure.typescript!.package.packageName,
        ...Object.values(props.deps).map((d) => d.package.packageName),
      ],
      devDeps: [
        "@types/aws-lambda",
        "@types/mapbox__polyline",
        "@types/jwk-to-pem",
        "@types/jsonwebtoken",
        "@types/uuid",
      ], // needed bc of pnpm
      name: `${this.packageNamespace}/web-api`,
      outdir: `${OUTDIR_BASE}/web-api`,
      parent: this.monorepoProject,
    });
    configureProject(webApi);
    // webApi
    //   .tryFindObjectFile("tsconfig.json")
    //   ?.addOverride("compilerOptions.declaration", false);
    this.webApi = webApi;
  }
}
