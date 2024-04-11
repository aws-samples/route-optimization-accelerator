/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  ColumnLayout,
  Modal,
  SpaceBetween,
  Toggle,
} from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { ValueWithLabel } from "../../../components/ValueWithLabel";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import CopyComponent from "../../../components/CopyComponent";
import { ExternalAPI } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useApiClient } from "../../../api/WebApi";
import dayjs from "../../../utils/dayjs";

export interface ExternalAPIDetailsProps {
  visible: boolean;
  data?: ExternalAPI;
  onClose: () => void;
}

const ExternalAPIDetails: React.FC<ExternalAPIDetailsProps> = ({
  visible,
  data,
  onClose,
}) => {
  const webApi = useApiClient();
  const [isVisible, setIsVisible] = useState<boolean>(visible);
  const [currentData, setCurrentData] = useState<ExternalAPI | undefined>(data);
  const [apiKey, setApiKey] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const closeAction = () => {
    setIsVisible(false);
    setApiKey("");

    if (onClose) {
      onClose();
    }
  };

  const getApiKey = async () => {
    setIsLoading(true);
    const result = await webApi.getExternalAPISecret({ id: currentData!.id });

    setApiKey(result.data.apiKey);
    setIsLoading(false);
  };

  return (
    <Modal
      visible={isVisible}
      onDismiss={closeAction}
      header="External API Details"
      size="large"
    >
      {currentData && (
        <ColumnLayout columns={2} variant="text-grid">
          <SpaceBetween size="l">
            <ValueWithLabel label="Name">
              {currentData.name || "-"}
            </ValueWithLabel>
            <ValueWithLabel label="Valid For (days)">
              {currentData.validFor}
            </ValueWithLabel>
            <ValueWithLabel label="Created At">
              <DateTimeLabel
                timestamp={currentData.createdAt}
                mode={DateTimeLabelMode.Relative}
              />
            </ValueWithLabel>
            <ValueWithLabel label="Created By">
              {currentData.createdBy || "-"}
            </ValueWithLabel>
            <ValueWithLabel label="Auth URL">
              {currentData.authUrl || "-"}
            </ValueWithLabel>
            <ValueWithLabel label="Enabled">
              <Toggle checked={currentData.enabled} disabled>
                {currentData.enabled ? "Yes" : "No"}
              </Toggle>
            </ValueWithLabel>
          </SpaceBetween>
          <SpaceBetween size="l">
            <ValueWithLabel label="ClientId">
              <CopyComponent
                text={currentData.clientId!}
                textToCopy={currentData.clientId!}
                name="Client ID"
              />
            </ValueWithLabel>
            <ValueWithLabel label="Expires At">
              <DateTimeLabel
                timestamp={dayjs(currentData.createdAt)
                  .add(currentData.validFor, "days")
                  .valueOf()}
                mode={DateTimeLabelMode.Relative}
              />
            </ValueWithLabel>
            <ValueWithLabel label="Updated At">
              <DateTimeLabel
                timestamp={currentData.updatedAt}
                mode={DateTimeLabelMode.Relative}
              />
            </ValueWithLabel>
            <ValueWithLabel label="Updated By">
              {currentData.createdBy || "-"}
            </ValueWithLabel>
            <ValueWithLabel label="API Key">
              {!apiKey ? (
                <Button
                  variant="normal"
                  onClick={getApiKey}
                  loading={isLoading}
                >
                  Get Key
                </Button>
              ) : (
                <CopyComponent
                  text={apiKey}
                  textToCopy={apiKey}
                  name="API Key"
                />
              )}
            </ValueWithLabel>
          </SpaceBetween>
        </ColumnLayout>
      )}
    </Modal>
  );
};

export default ExternalAPIDetails;
