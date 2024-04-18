/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Alert,
  Box,
  Container,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useContext } from "react";
import "ace-builds/css/ace.css";
import "ace-builds/css/theme/dawn.css";
import "ace-builds/css/theme/tomorrow_night_bright.css";
import { ExternalAPIPageWrapper } from "..";
import { RuntimeConfigContext } from "../../../context/RuntimeContext";
import { v4 as uuidv4 } from "uuid";
// @ts-ignore
import sh from "@cloudscape-design/code-view/highlight/sh";
import { CodeView } from "@cloudscape-design/code-view";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";

const getFleetPosition = (apiBaseUrl: string) =>
  `curl -H "Content-Type: application/json" \\
-H "Authorization: API-Key [your-api-key]" \\
-X GET ${apiBaseUrl}fleet/[fleet-member-id]/position`;

const updateFleetPosition = (apiBaseUrl: string) =>
  `curl -H "Content-Type: application/json" \\
-H "Authorization: API-Key [your-api-key]" \\
-X PUT ${apiBaseUrl}fleet/[fleet-member-id]/position \\
-d @- << EOF
{
  "data": {
    "position": {
      "latitude": 47.615892381015875,
      "longitude": -122.33824533863171
    }
  }
}
EOF`;

const listOptimizations = (apiBaseUrl: string) =>
  `curl -H "Content-Type: application/json" \\
-H "Authorization: API-Key [your-api-key]" \\
-X GET ${apiBaseUrl}route-optimization`;

const createNewOptimization = (
  apiBaseUrl: string,
) => `curl -H "Content-Type: application/json" \\
-H "Authorization: API-Key [your-api-key]" \\
-X POST ${apiBaseUrl}route-optimization \\
-d @- << EOF
{
  "data": {
    "problemId": "${uuidv4()}",
    "fleet": [
      {
        "id": "fleet-1",
        "startingLocation": {
          "latitude": 47.58758077964066,
          "longitude": -122.24411681313705,
          "id": "depot"
        },
        "preferredDepartureTime": "2024-02-11T07:00:00",
        "backToOrigin": true
      }
    ],
    "orders": [
      {
        "id": "order-1",
        "origin": {
          "latitude": 47.58758077964066,
          "longitude": -122.24411681313705,
          "id": "depot"
        },
        "destination": {
          "latitude": 47.44698579335265,
          "longitude": -122.24363815840434,
          "id": "customer-1"
        },
        "serviceTime": 3600,
        "serviceWindow": {
          "from": "2024-02-11T07:00:00",
          "to": "2024-02-11T12:00:00"
        }
      },
      {
        "id": "order-2",
        "origin": {
          "latitude": 47.58758077964066,
          "longitude": -122.24411681313705,
          "id": "depot"
        },
        "destination": {
          "latitude": 47.66652384516118,
          "longitude": -122.37044619357494,
          "id": "customer-2"
        },
        "serviceTime": 3600,
        "serviceWindow": {
          "from": "2024-02-11T07:00:00",
          "to": "2024-02-11T12:00:00"
        }
      },
      {
        "id": "order-3",
        "origin": {
          "latitude": 47.58758077964066,
          "longitude": -122.24411681313705,
          "id": "depot"
        },
        "destination": {
          "latitude": 47.23394925508806,
          "longitude": -122.4258670753003,
          "id": "customer-3"
        },
        "serviceTime": 1800,
        "serviceWindow": {
          "from": "2024-02-11T07:00:00",
          "to": "2024-02-11T12:00:00"
        }
      },
      {
        "id": "order-4",
        "origin": {
          "latitude": 47.58758077964066,
          "longitude": -122.24411681313705,
          "id": "depot"
        },
        "destination": {
          "latitude": 47.656237058705756,
          "longitude": -122.28922645931934,
          "id": "customer-4"
        },
        "serviceTime": 3000,
        "serviceWindow": {
          "from": "2024-02-11T12:00:00",
          "to": "2024-02-11T18:00:00"
        }
      }
    ],
    "createdAt": ${Date.now()},
    "updatedAt": ${Date.now()}
  }
}
EOF
`;

const ExternalAPIUsage = () => {
  const context = useContext(RuntimeConfigContext);

  return (
    <ExternalAPIPageWrapper isLoading={false}>
      <Container>
        <SpaceBetween size="l">
          <Header>External API Usage</Header>
          <Alert type="warning">
            Change <strong>[your-api-key]</strong> to match one of your existing
            External API key
          </Alert>

          <Box variant="strong">
            Invoke the API to get a vehicle's current position (remember to
            change <em>[fleet-member-id]</em> with the ID of your vehicle)
          </Box>
          <CodeView
            content={getFleetPosition(context?.apiUrl!)}
            highlight={sh}
            lineNumbers
            actions={
              <CopyToClipboard
                copyButtonAriaLabel="Copy code"
                copyErrorText="Code failed to copy"
                copySuccessText="Code copied"
                textToCopy={getFleetPosition(context?.apiUrl!)}
              />
            }
          />

          <Box variant="strong">
            Invoke the API to update a vehicle's position (remember to change{" "}
            <em>[fleet-member-id]</em> with the ID of your vehicle)
          </Box>
          <CodeView
            content={updateFleetPosition(context?.apiUrl!)}
            highlight={sh}
            lineNumbers
            actions={
              <CopyToClipboard
                copyButtonAriaLabel="Copy code"
                copyErrorText="Code failed to copy"
                copySuccessText="Code copied"
                textToCopy={updateFleetPosition(context?.apiUrl!)}
              />
            }
          />

          <Box variant="strong">
            Invoke the API to get the current list of route-optimizations
          </Box>
          <CodeView
            content={listOptimizations(context?.apiUrl!)}
            highlight={sh}
            lineNumbers
            actions={
              <CopyToClipboard
                copyButtonAriaLabel="Copy code"
                copyErrorText="Code failed to copy"
                copySuccessText="Code copied"
                textToCopy={listOptimizations(context?.apiUrl!)}
              />
            }
          />
          <Box variant="strong">
            Invoke the API to create a route optimization task
          </Box>
          <CodeView
            content={createNewOptimization(context?.apiUrl!)}
            highlight={sh}
            lineNumbers
            actions={
              <CopyToClipboard
                copyButtonAriaLabel="Copy code"
                copyErrorText="Code failed to copy"
                copySuccessText="Code copied"
                textToCopy={createNewOptimization(context?.apiUrl!)}
              />
            }
          />
        </SpaceBetween>
      </Container>
    </ExternalAPIPageWrapper>
  );
};

export default ExternalAPIUsage;
