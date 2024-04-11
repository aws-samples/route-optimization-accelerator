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
  TimeInput,
  Toggle,
} from "@cloudscape-design/components";
import { OptimizationVirtualFleet } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useEffect, useState } from "react";
import { PlaceFinder } from "../../../../components/PlaceFinder";
import { DEFAULT_CONFIG } from "../../../../components/OptimizationConfiguration";
import { TokenEditor } from "../../../../components/TokenEditor";

export interface NewVirtualFleetModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (virtualFleet: OptimizationVirtualFleet) => void;
}

const NewVirtualFleetModal: React.FC<NewVirtualFleetModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(visible);
  const [creating, setCreating] = useState<boolean>();
  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [virtualFleet, setVirtualFleet] =
    useState<Partial<OptimizationVirtualFleet>>();

  useEffect(() => {
    setIsVisible(visible);
    setVirtualFleet(undefined);
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
    if (
      !virtualFleet ||
      !virtualFleet.groupId ||
      !virtualFleet.size ||
      !virtualFleet.startingLocation
    ) {
      setAlertMessage(
        "Group ID, Size and Starting Location are required fields",
      );
      return;
    }

    if (onCreate) {
      setCreating(true);

      // @ts-ignore
      await onCreate(virtualFleet);

      setCreating(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      onDismiss={closeAction}
      size="large"
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
      header="New Virtual Fleet"
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
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField label="Group ID" description="The virtual fleet group Id">
            <Input
              value={virtualFleet?.groupId || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  groupId: detail.value,
                }))
              }
              placeholder="VG001"
            />
          </FormField>
          <FormField
            label="Size"
            description="The number of fleet members in this group"
          >
            <Input
              type="number"
              value={virtualFleet?.size?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  size: Number(detail.value),
                }))
              }
              placeholder="12"
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField
            label="Starting Location"
            description="Fleet group starting location (e.g depot)"
          >
            <PlaceFinder
              selectedItemValue={virtualFleet?.startingLocation?.id || ""}
              onSelect={(selection) =>
                setVirtualFleet((old) => ({
                  ...old,
                  startingLocation: selection
                    ? {
                        id: selection?.id,
                        latitude: selection.position.latitude,
                        longitude: selection.position.longitude,
                      }
                    : undefined!,
                }))
              }
            />
          </FormField>
          <FormField
            label="Preferred Departure Time"
            description="The time of the day when the virtual fleet can leave the depot"
          >
            <TimeInput
              value={virtualFleet?.preferredDepartureTime?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  preferredDepartureTime: detail.value,
                }))
              }
              placeholder="09:30"
              format="hh:mm"
            />
          </FormField>
        </Grid>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField
            label="Back To Origin"
            description="Define wether the virtual fleet must go back to starting location"
          >
            <Toggle
              checked={
                virtualFleet?.backToOrigin !== undefined
                  ? virtualFleet?.backToOrigin
                  : DEFAULT_CONFIG.backToOrigin!
              }
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  backToOrigin: detail.checked,
                }))
              }
            />
          </FormField>
          <FormField
            label="Attributes"
            description="Define additional attributes or skills"
          >
            <TokenEditor
              attributes={virtualFleet?.attributes}
              onChange={(attributes) =>
                setVirtualFleet((old) => ({ ...old, attributes }))
              }
              tokenGroupLimit={3}
            />
          </FormField>
        </Grid>
        <Box variant="h4">Limits</Box>
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField
            label="Max Orders"
            description="The maximum amount of orders that the each individual fleet member in this group can handle"
          >
            <Input
              type="number"
              value={virtualFleet?.limits?.maxOrders?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  limits: {
                    ...(old?.limits || {}),
                    maxOrders: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 5"
            />
          </FormField>

          <FormField
            label="Max Distance"
            description="The maximum distance (meters) that the each individual fleet member can run"
          >
            <Input
              type="number"
              value={virtualFleet?.limits?.maxDistance?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  limits: {
                    ...(old?.limits || {}),
                    maxDistance: detail.value
                      ? Number(detail.value)
                      : undefined,
                  },
                }))
              }
              placeholder="e.g. 1500"
            />
          </FormField>
        </Grid>

        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField
            label="Max Time"
            description="The maximum amount of time (seconds) each fleet member can spend on the road"
          >
            <Input
              type="number"
              value={virtualFleet?.limits?.maxTime?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  limits: {
                    ...(old?.limits || {}),
                    maxTime: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 7200"
            />
          </FormField>

          <FormField
            label="Max Capacity"
            description="The maximum capacity (e.g. KGs) that each individual virtual fleet member support"
          >
            <Input
              type="number"
              value={virtualFleet?.limits?.maxCapacity?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  limits: {
                    ...(old?.limits || {}),
                    maxCapacity: detail.value
                      ? Number(detail.value)
                      : undefined,
                  },
                }))
              }
              placeholder="e.g. 2500"
            />
          </FormField>
        </Grid>

        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <FormField
            label="Max Volume"
            description="The maximum volume (e.g. M3) that each fleet member support"
          >
            <Input
              type="number"
              value={virtualFleet?.limits?.maxVolume?.toString() || ""}
              onChange={({ detail }) =>
                setVirtualFleet((old) => ({
                  ...(old || {}),
                  limits: {
                    ...(old?.limits || {}),
                    maxVolume: detail.value ? Number(detail.value) : undefined,
                  },
                }))
              }
              placeholder="e.g. 2.4"
            />
          </FormField>
        </Grid>
      </SpaceBetween>
    </Modal>
  );
};

export default NewVirtualFleetModal;
