/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Alert,
  Box,
  Button,
  FormField,
  Grid,
  Input,
  Modal,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { DEFAULTS } from "../../../utils/common";

export interface NewExternalAPIProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, validFor: number) => void;
}

const NewExternalAPI: React.FC<NewExternalAPIProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(visible);
  const [name, setName] = useState<string>();
  const [creating, setCreating] = useState<boolean>();
  const [validFor, setValidFor] = useState<number>();
  const [alertMessage, setAlertMessage] = useState<string | undefined>();

  useEffect(() => {
    setIsVisible(visible);
    setName("");
    setValidFor(undefined);
    setAlertMessage(undefined);
    setCreating(false);
  }, [visible]);

  const closeAction = () => {
    setIsVisible(false);

    if (onClose) {
      onClose();
    }
  };

  const onCreateHandler = async () => {
    if (!name || !validFor) {
      setAlertMessage("Both name and validity are required");
      return;
    }

    if (validFor > DEFAULTS.tokenDuration) {
      setAlertMessage(
        `The maximum token duration cannot exceed ${DEFAULTS.tokenDuration} days`,
      );
      return;
    }

    if (onCreate) {
      setCreating(true);

      await onCreate(name, validFor);

      setCreating(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      onDismiss={closeAction}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="normal" onClick={closeAction}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onCreateHandler}
              disabled={creating}
            >
              Create
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="New External API"
    >
      <SpaceBetween direction="vertical" size="m">
        {alertMessage && (
          <Alert
            type="warning"
            dismissible
            onDismiss={() => setAlertMessage(undefined)}
          >
            {alertMessage}
          </Alert>
        )}
        <Grid gridDefinition={[{ colspan: 12 }]}>
          <FormField label="Name" description="The name of the External API">
            <Input
              value={name || ""}
              onChange={({ detail }) => setName(detail.value)}
              placeholder="Name"
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 12 }]}>
          <FormField
            label="Validity"
            description="Set the validity of the API (in days)"
          >
            <Input
              value={validFor?.toString() || ""}
              onChange={({ detail }) => setValidFor(Number(detail.value))}
              placeholder="Valid for (e.g. 60)"
              type="number"
            />
          </FormField>
        </Grid>
      </SpaceBetween>
    </Modal>
  );
};

export default NewExternalAPI;
