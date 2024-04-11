/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CognitoAuthContextAPI, CognitoUserSession } from "@aws-northstar/ui";
import {
  CognitoIdentityCredentialProvider,
  fromCognitoIdentityPool,
} from "@aws-sdk/credential-provider-cognito-identity";

export const getCognitoSessionFromContext = (context: CognitoAuthContextAPI) =>
  new Promise<CognitoUserSession>((resolve, reject) =>
    context
      .getAuthenticatedUser()!
      .getSession((error: any, session: CognitoUserSession) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(session);
      }),
  );

export const getCognitoCredentials = async (
  session: CognitoUserSession,
  region: string,
  identityPoolId: string,
  userPoolId: string,
): Promise<CognitoIdentityCredentialProvider> => {
  return fromCognitoIdentityPool({
    clientConfig: { region },
    identityPoolId: identityPoolId!,
    logins: {
      [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: session
        .getIdToken()
        .getJwtToken(),
    },
  });
};
