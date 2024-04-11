/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import path from "path";
import { StaticWebsite, StaticWebsiteOrigin } from "@aws/pdk/static-website";
import { Stack } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { sync as findUpSync } from "find-up";
import { WEB } from "../../utils/default-settings";

export interface WebAppProps {
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
  identityPool: cognito.CfnIdentityPool;
  logBucket: s3.IBucket;
  map: string;
  calculator: string;
  placeTracker: string;
  fleetTracker: string;
  placeIndex: string;
  placeIndexLanguage: string;
  defaultMapCenter: number[];
  webApiUrl: string;
}

export class WebApp extends Construct {
  public readonly webSite: StaticWebsite;

  constructor(scope: Construct, id: string, props: WebAppProps) {
    super(scope, id);

    const packagesDir =
      findUpSync("packages", { cwd: __dirname, type: "directory" }) ||
      "../../../../../";

    const {
      identityPool,
      userPool,
      userPoolClient,
      webApiUrl,
      logBucket,
      ...others
    } = props;

    this.webSite = new StaticWebsite(this, "StaticWebsite", {
      websiteContentPath: path.join(packagesDir, "web-ui", "build"),
      runtimeOptions: {
        jsonPayload: {
          region: Stack.of(this).region,
          identityPoolId: identityPool.ref,
          userPoolId: userPool.userPoolId,
          userPoolWebClientId: userPoolClient.userPoolClientId,
          apiUrl: webApiUrl,
          ...others,
        },
      },
      distributionProps: {
        enableLogging: true,
        logBucket,
        logFilePrefix: "web-ui/",
        defaultBehavior: {
          origin: StaticWebsiteOrigin,
        },
        geoRestriction: {
          locations: WEB.allowedCountries,
          restrictionType: "whitelist",
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: "/",
          },
        ],
      },
    });
  }
}
