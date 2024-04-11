/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { PDKNag } from "@aws/pdk/pdk-nag";
import { Stack } from "aws-cdk-lib";

export const applyNagSuppressions = (app: Stack) => {
  PDKNag.addResourceSuppressionsByPathNoThrow(
    app,
    "/InfraDev/CommonResources/AccessLogsBucket/Resource",
    [
      {
        id: "AwsPrototyping-S3BucketLoggingEnabled",
        reason: "Logging it's not requierd in the Access logs Bucket",
      },
    ],
  );
  PDKNag.addResourceSuppressionsByPathNoThrow(
    app,
    "/InfraDev/AppIdentity/WebPool/Resource",
    [
      {
        id: "AwsPrototyping-CognitoUserPoolMFA",
        reason: "MFA is a path to production concern",
      },
    ],
  );
  PDKNag.addResourceSuppressionsByPathNoThrow(
    app,
    "/InfraDev/EngineInfra/TaskDef/TaskDefinition/Resource",
    [
      {
        id: "AwsPrototyping-ECSTaskDefinitionNoEnvironmentVariables",
        reason:
          "The environment variables used in the task definition do not include sensitive information, but variables that are easily",
      },
    ],
  );
  PDKNag.addResourceSuppressionsByPathNoThrow(
    app,
    "/InfraDev/EngineInfra/TaskDef/TaskDefinition/ExecutionRole/DefaultPolicy/Resource",
    [
      {
        id: "AwsPrototyping-IAMNoWildcardPermissions",
        reason:
          "Wildcard provided automatically by CDK to run the ecr:GetAuthorizationToken required to pull the image",
      },
    ],
  );
  const services = [
    "Services/RouteOptimization",
    "Services/ExternalAPI",
    "Services/Place",
    "Services/Fleet",
    "Services/Order",
    "CustomAuthFunction",
  ];
  services.forEach((q) => {
    PDKNag.addResourceSuppressionsByPathNoThrow(
      app,
      `/InfraDev/${q}`,
      [
        {
          id: "AwsPrototyping-IAMNoManagedPolicies",
          reason:
            "Managed policies added automatically by CDK (AWSLambdaBasicExecutionRole and CloudWatchLambdaInsightsExecutionRolePolicy)",
        },
      ],
      true,
    );
  });

  PDKNag.addResourceSuppressionsByPathNoThrow(
    app,
    "/InfraDev/WebApi/PrepareSpecHandler/Resource",
    [
      {
        id: "AwsPrototyping-LambdaLatestVersion",
        reason: "Lambda managed by PDK",
      },
    ],
  );

  PDKNag.addResourceSuppressionsByPathNoThrow(
    app,
    "/InfraDev/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C",
    [
      {
        id: "AwsPrototyping-IAMNoWildcardPermissions",
        reason: "CDK deployment resources are managed by CDK",
      },
      {
        id: "AwsPrototyping-IAMNoManagedPolicies",
        reason:
          "CDK deployment resources are managed by CDK, it uses AWSLambdaBasicExecutionRole managed policy",
      },
      {
        id: "AwsPrototyping-LambdaLatestVersion",
        reason:
          "CDK deployment resources are managed by CDK, can't control the runtime version",
      },
    ],
    true,
  );
};
