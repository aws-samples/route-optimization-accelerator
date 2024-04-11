/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useEffect, useState } from "react";
import { ExternalAPIPageWrapper } from "../";
import {
  Alert,
  Button,
  ButtonDropdown,
  Container,
  Icon,
  Link,
  Popover,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useApiClient } from "../../../api/WebApi";
import { Optional } from "../../../utils/common";
import { v4 as uuidv4 } from "uuid";
import {
  ExternalAPI,
  ListExternalAPIsResponseContent,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import dayjs from "../../../utils/dayjs";
import NewExternalAPI from "../New";
import ExternalAPIDetails from "../Detail";
import { DeleteConfirmationDialog } from "@aws-northstar/ui";
import CommonTable from "../../../components/CommonTable";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";

type PageMode = "default" | "New" | "Detail" | "Delete" | "Enable" | "Disable";

const ListExternalAPI: React.FC = () => {
  const webApi = useApiClient();
  const [pageMode, setPageMode] = useState<PageMode>("default");
  const [selectedItems, setSelectedItems] = useState<ExternalAPI[]>();
  const [detailItem, setDetailItem] = useState<ExternalAPI>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [currentExternalAPI, setCurrentExternalAPI] =
    useState<Optional<ExternalAPI>>();
  const [refresh, setRefresh] = useState<number>(0);
  const [alert, setAlert] = useState<Optional<AlertContent>>();

  const createHandler = async (name: string, validFor: number) => {
    await webApi.createExternalAPI({
      createExternalAPIRequestContent: {
        data: {
          id: uuidv4(),
          name,
          validFor,
          enabled: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
    });
    setPageMode("default");
    setRefresh((old) => old + 1);
  };

  useEffect(() => {
    if (detailItem) {
      setPageMode("Detail");
      setCurrentExternalAPI(detailItem);
    }
  }, [detailItem]);

  const deleteExternalAPIs = async () => {
    const execute = (id: string) =>
      webApi.deleteExternalAPI({
        id,
      });

    try {
      setActionLoading(true);
      const promises = selectedItems!.map((q) => execute(q.id));

      await Promise.all(promises);

      setRefresh((old) => old + 1);
    } catch (err) {
      console.error(err);
      handleError("Unable to delete the selected items");
    } finally {
      setActionLoading(false);
      setDeleteConfirmation(false);
      setSelectedItems(undefined);
    }
  };

  const enableExternalAPIs = async (enable: boolean) => {
    const execute = (id: string, data: ExternalAPI) =>
      webApi.updateExternalAPI({
        id,
        updateExternalAPIRequestContent: { data: { ...data, enabled: enable } },
      });

    try {
      setActionLoading(true);

      const promises = selectedItems!.map((q) => execute(q.id, q));
      await Promise.all(promises);

      setRefresh((old) => old + 1);
    } catch (err) {
      handleError("Uneable to update the status of the selected items");
    } finally {
      setActionLoading(false);
    }
  };

  const handleError = (message: string) => {
    setAlert({ type: "error", message });
  };

  const createNewHandler = () => setPageMode("New");

  return (
    <ExternalAPIPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <DeleteConfirmationDialog
            visible={deleteConfirmation}
            title="Delete Selected elements"
            onCancelClicked={() => setDeleteConfirmation(false)}
            onDeleteClicked={deleteExternalAPIs}
            loading={isLoading}
          >
            <Alert type="warning">
              This will delete the following external APIs:
              <ul style={{ paddingLeft: "1rem" }}>
                {selectedItems?.map((item: any) => (
                  <li key={item.id}>
                    <strong>{item.name}</strong>
                  </li>
                ))}
              </ul>
              Are you sure to proceed? This action cannot be reverted.
            </Alert>
          </DeleteConfirmationDialog>
          <SpaceBetween direction="vertical" size="l">
            <AlertWrapper alert={alert} />
            <CommonTable<ExternalAPI, ListExternalAPIsResponseContent>
              headerText="External API list"
              idPropertyName="id"
              missingItemsText="No External APIs configured"
              loadingText="Loading external APIs"
              filterText="Search external APIs by name"
              createNewTextEmptyBox="Create a new External API"
              onError={(message) => setAlert({ type: "error", message })}
              onLoadingChange={(loading) => setIsLoading(loading)}
              onCreateNew={createNewHandler}
              refresh={refresh}
              actionLoading={actionLoading}
              headerActions={
                <SpaceBetween direction="horizontal" size="xs">
                  <ButtonDropdown
                    onItemClick={async (link) => {
                      if (link.detail.id === "delete") {
                        setDeleteConfirmation(true);
                      }

                      if (link.detail.id === "enable") {
                        await enableExternalAPIs(true);
                      }
                      if (link.detail.id === "disable") {
                        await enableExternalAPIs(false);
                      }
                    }}
                    items={[
                      {
                        text: "Update Status",
                        items: [
                          {
                            text: "Enable",
                            id: "enable",
                            iconName: "check",
                            disabled: !selectedItems || !selectedItems.length,
                          },
                          {
                            text: "Disable",
                            id: "disable",
                            iconName: "close",
                            disabled: !selectedItems || !selectedItems.length,
                          },
                        ],
                      },
                      {
                        text: "Delete",
                        id: "delete",
                        disabled: !selectedItems || !selectedItems.length,
                        iconName: "remove",
                      },
                    ]}
                  >
                    Actions
                  </ButtonDropdown>
                  <Button variant="primary" onClick={createNewHandler}>
                    Create New
                  </Button>
                </SpaceBetween>
              }
              selectionType="multi"
              onSelectionChange={(selectedItems) =>
                setSelectedItems(selectedItems)
              }
              columndDefinition={[
                {
                  id: "name",
                  header: "Name",
                  cell: (e) => e.name,
                },
                {
                  id: "clientId",
                  header: "Client ID",
                  cell: (e) => e.clientId,
                },
                {
                  id: "createdAt",
                  header: "Created at",
                  cell: (e) => (
                    <DateTimeLabel
                      allowDateFlipping={false}
                      timestamp={e.createdAt}
                      mode={DateTimeLabelMode.Relative}
                    />
                  ),
                },
                {
                  id: "expires",
                  header: "Expires at",
                  cell: (e) => (
                    <DateTimeLabel
                      allowDateFlipping={false}
                      timestamp={dayjs(e.createdAt)
                        .add(e.validFor, "days")
                        .valueOf()}
                      mode={DateTimeLabelMode.Relative}
                    />
                  ),
                },
                {
                  id: "createdBy",
                  header: "Created By",
                  cell: (e) => e.createdBy,
                },
                {
                  id: "enabled",
                  header: "Enabled",
                  cell: (e) => (
                    <Icon
                      name={e.enabled ? "check" : "close"}
                      size="small"
                      variant={e.enabled ? "success" : "error"}
                    />
                  ),
                },
                {
                  id: "expired",
                  header: "Expired",
                  cell: (e) => {
                    const expireAt = dayjs(e.createdAt)
                      .add(e.validFor, "days")
                      .valueOf();
                    const expired = expireAt < Date.now();
                    return (
                      <Popover
                        content={`The API key has ${expired ? "" : "not"} expired`}
                      >
                        <Icon
                          name={expired ? "status-positive" : "status-negative"}
                          size="small"
                          variant={expired ? "error" : "success"}
                        />
                      </Popover>
                    );
                  },
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: (e) => (
                    <>
                      <Icon name="file-open" />{" "}
                      <Link onFollow={() => setDetailItem(e)}>Details</Link>
                    </>
                  ),
                },
              ]}
              fetchFunction={(lastEvaluatedKey, filterText) =>
                webApi.listExternalAPIs({
                  exclusiveStartKey: lastEvaluatedKey,
                  name: filterText,
                })
              }
            />
          </SpaceBetween>

          <NewExternalAPI
            visible={pageMode === "New"}
            onClose={() => setPageMode("default")}
            onCreate={createHandler}
          />
          <ExternalAPIDetails
            visible={pageMode === "Detail"}
            onClose={() => {
              setPageMode("default");
              setDetailItem(undefined);
            }}
            data={currentExternalAPI}
          />
        </Container>
      </SpaceBetween>
    </ExternalAPIPageWrapper>
  );
};

export default ListExternalAPI;
