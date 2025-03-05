/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { RemovalPolicy, Stack, Token } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface ApplicationIdentityProps {
  alsResources: string[];
  adminUserEmail: string;
  adminUsername: string;
}

export class ApplicationIdentity extends Construct {
  public readonly userPool: cognito.UserPool;

  public readonly userPoolClient: cognito.UserPoolClient;

  public readonly identityPool: cognito.CfnIdentityPool;

  public readonly cognitoDomain: string;

  public readonly appExternalScope: string;

  private readonly rsiScopeName = { scopeName: "external", rsi: "app" };

  constructor(scope: Construct, id: string, props: ApplicationIdentityProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "WebPool", {
      signInCaseSensitive: false,
      standardAttributes: {
        givenName: {
          mutable: true,
          required: false,
        },
        familyName: {
          mutable: true,
          required: false,
        },
        email: {
          mutable: true,
          required: true,
        },
        phoneNumber: {
          mutable: true,
          required: true,
        },
      },
      autoVerify: {
        email: true,
      },
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: false,
      passwordPolicy: {
        minLength: 10,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      enableSmsRole: false,
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
      featurePlan: cognito.FeaturePlan.PLUS,
    });

    this.userPoolClient = this.userPool.addClient("web-app");

    const stack = Stack.of(this);
    const encodedAccountNumber = !Token.isUnresolved(stack.account)
      ? Number(stack.account).toString(36)
      : Date.now().toString(36);

    const domain = this.userPool.addDomain("CognitoDomain", {
      cognitoDomain: {
        domainPrefix: `roa${encodedAccountNumber}`,
      },
    });
    this.cognitoDomain = `${domain.domainName}.auth.${stack.region}.amazoncognito.com`;

    const addResourceServerIdentifier = this.rsiScopeName.rsi;
    const userIdScope = new cognito.ResourceServerScope({
      scopeName: this.rsiScopeName.scopeName,
      scopeDescription: "scope used when issuing a new External Api Key",
    });
    this.userPool.addResourceServer("AppResourceServer", {
      identifier: addResourceServerIdentifier,
      scopes: [userIdScope],
    });
    this.appExternalScope = `${addResourceServerIdentifier}/${userIdScope.scopeName}`;

    this.identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
      allowUnauthenticatedIdentities: false,
    });

    const identityPoolAuthRole = new iam.Role(this, "AppPoolAuthRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            [`cognito-identity.amazonaws.com:aud`]: this.identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            [`cognito-identity.amazonaws.com:amr`]: "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity",
      ),
      inlinePolicies: {
        AmazonLocationServiceAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "geo:GetMapGlyphs",
                "geo:GetMapSprites",
                "geo:GetMapStyleDescriptor",
                "geo:GetMapTile",
                "geo:SearchPlaceIndexForPosition",
                "geo:SearchPlaceIndexForSuggestions",
                "geo:SearchPlaceIndexForText",
                "geo:GetPlace",
                "geo:CalculateRoute",
                "geo:CalculateRouteMatrix",
                "geo:GetDevicePosition",
                "geo:GetDevicePositionHistory",
              ],
              resources: props.alsResources,
              conditions: {
                StringLike: {
                  "aws:referer": [
                    "https://*.cloudfront.net/*",
                    "http://localhost:*/*",
                  ],
                },
              },
            }),
          ],
        }),
      },
    });

    const identityPoolUnauthRole = new iam.Role(this, "AppPoolUnauthRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            [`cognito-identity.amazonaws.com:aud`]: this.identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            [`cognito-identity.amazonaws.com:amr`]: "unauthenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity",
      ),
      // no access provided to unauthenticated users
    });

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: this.identityPool.ref,
        roles: {
          ["authenticated"]: identityPoolAuthRole.roleArn,
          ["unauthenticated"]: identityPoolUnauthRole.roleArn,
        },
      },
    );

    const defaultEmailAddress = props.adminUserEmail;
    const defaultCognitoUser = new cognito.CfnUserPoolUser(
      this,
      "DefaultAdminUser",
      {
        userPoolId: this.userPool.userPoolId,
        desiredDeliveryMediums: ["EMAIL"],
        forceAliasCreation: true,
        userAttributes: [
          { name: "email", value: defaultEmailAddress },
          { name: "email_verified", value: "true" },
        ],
        username: props.adminUsername,
      },
    );
    defaultCognitoUser.applyRemovalPolicy(RemovalPolicy.RETAIN);
  }
}
