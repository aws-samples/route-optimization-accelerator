/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { FleetPageWrapper } from "..";
import {
  Alert,
  Box,
  Button,
  ButtonDropdown,
  Container,
  Icon,
  Link,
  SegmentedControl,
  SpaceBetween,
  Toggle,
} from "@cloudscape-design/components";
import CommonTable from "../../../components/CommonTable";
import { useApiClient } from "../../../api/WebApi";
import { useNavigate } from "react-router-dom";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import {
  Optional,
  SELECTABLE_VIEWS_OPTIONS,
  ViewOptionType,
} from "../../../utils/common";
import {
  Fleet,
  ListFleetPositionsOutputDataMember,
  ListFleetPositionsResponseContent,
  ListFleetResponseContent,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { DeleteConfirmationDialog } from "@aws-northstar/ui";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import { DEFAULT_CONFIG } from "../../../components/OptimizationConfiguration";
import MapPopover from "../../../components/MapPopover";
import CommonMap from "../../../components/CommonMap";
import FleetLimitsPopover from "../../../components/FleetLimitPopover";

const ListFleet: React.FC = () => {
  const webApi = useApiClient();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState(ViewOptionType.table);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const [mapAlert, setMapAlert] = useState<Optional<AlertContent>>();
  const [selection, setSelection] = useState<Optional<Fleet[]>>();
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  const createNewHandler = () => navigate("/fleet/new");

  const deleteElements = async () => {
    const execute = (id: string) =>
      webApi.deleteFleet({
        id,
      });

    try {
      setActionLoading(true);
      const promises = selection!.map((q) => execute(q.id));

      await Promise.all(promises);

      setRefresh((old) => old + 1);
    } catch (err) {
      console.error(err);
      setAlert({
        type: "error",
        message: "Unable to delete the selected items",
      });
    } finally {
      setActionLoading(false);
      setDeleteConfirmation(false);
      setSelection(undefined);
    }
  };

  return (
    <FleetPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <DeleteConfirmationDialog
            visible={deleteConfirmation}
            title="Delete Selected elements"
            onCancelClicked={() => setDeleteConfirmation(false)}
            onDeleteClicked={deleteElements}
            loading={isLoading}
          >
            <Alert type="warning">
              This will delete the following fleet members:
              <ul style={{ paddingLeft: "1rem" }}>
                {selection?.map((item: any) => (
                  <li key={item.id}>
                    <strong>{item.name}</strong>
                  </li>
                ))}
              </ul>
              Are you sure to proceed? This action cannot be reverted.
            </Alert>
          </DeleteConfirmationDialog>
          <SpaceBetween size="l">
            <SegmentedControl
              selectedId={selectedView}
              onChange={({ detail }) =>
                setSelectedView(detail.selectedId as ViewOptionType)
              }
              label="Select the view"
              options={SELECTABLE_VIEWS_OPTIONS}
            />

            {selectedView === ViewOptionType.table && (
              <>
                <AlertWrapper alert={alert} />
                <CommonTable<Fleet, ListFleetResponseContent>
                  headerText="Fleet"
                  idPropertyName="id"
                  missingItemsText="No fleet members found"
                  loadingText="Loading fleet members"
                  filterText="Search fleet by name"
                  createNewTextEmptyBox="Create a new fleet member"
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
                        }}
                        items={[
                          {
                            text: "Delete",
                            id: "delete",
                            disabled: !selection || !selection.length,
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
                    setSelection(selectedItems)
                  }
                  columndDefinition={[
                    {
                      id: "name",
                      header: "Name",
                      cell: (e) => e.name,
                    },
                    {
                      id: "position",
                      header: "Starting Location",
                      cell: (e) => (
                        <MapPopover
                          lat={e.startingLocation.latitude}
                          lon={e.startingLocation.longitude}
                          markers={[
                            [
                              e.startingLocation.longitude,
                              e.startingLocation.latitude,
                              {
                                color: "red",
                                popupContent: (
                                  <Link
                                    href={`/place/${e.startingLocation.id}`}
                                    target="_blank"
                                  >
                                    Starting Location
                                  </Link>
                                ),
                              },
                            ],
                          ]}
                        >
                          Location
                        </MapPopover>
                      ),
                    },
                    {
                      id: "limits",
                      header: "Limits",
                      cell: (e) => <FleetLimitsPopover limits={e.limits} />,
                    },
                    {
                      id: "backToOrigin",
                      header: "Back to origin",
                      cell: (e) => (
                        <Toggle
                          checked={
                            e.backToOrigin !== undefined
                              ? e.backToOrigin
                              : DEFAULT_CONFIG.backToOrigin!
                          }
                          disabled
                        />
                      ),
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
                      id: "actions",
                      header: "Actions",
                      cell: (e) => (
                        <>
                          <Icon name="file-open" />{" "}
                          <Link onFollow={() => navigate(`${e.id}`)}>
                            Details
                          </Link>{" "}
                          | <Icon name="edit" />{" "}
                          <Link onFollow={() => navigate(`${e.id}/edit`)}>
                            Edit
                          </Link>
                        </>
                      ),
                    },
                  ]}
                  fetchFunction={(lastEvaluatedKey, filterText) =>
                    webApi.listFleet({
                      exclusiveStartKey: lastEvaluatedKey,
                      name: filterText,
                    })
                  }
                />
              </>
            )}
            {selectedView === ViewOptionType.map && (
              <>
                <AlertWrapper
                  alert={{
                    type: "info",
                    message:
                      "The map below represent the real-time location of the fleet members. The location has to be updated using the API in order to be shown correctly",
                  }}
                />
                <AlertWrapper alert={mapAlert} />
                <CommonMap<
                  ListFleetPositionsOutputDataMember,
                  ListFleetPositionsResponseContent
                >
                  displayData={(q) => ({
                    popupContent: (
                      <Box>
                        <strong>Fleet:</strong>{" "}
                        <a
                          target="_blank"
                          href={`/fleet/${q.id}`}
                          rel="noreferrer"
                        >
                          {q.name}
                        </a>
                      </Box>
                    ),
                  })}
                  onOutOfBound={(isOutOfRange: boolean) =>
                    setMapAlert(
                      isOutOfRange
                        ? {
                            message: "Zoom-in to load the data",
                            type: "warning",
                          }
                        : undefined,
                    )
                  }
                  fetchFunction={(bounds) =>
                    webApi.listFleetPositions({
                      listFleetPositionsRequestContent: {
                        data: {
                          polygon: [
                            [
                              bounds.getSouthWest().toArray(),
                              bounds.getSouthEast().toArray(),
                              bounds.getNorthEast().toArray(),
                              bounds.getNorthWest().toArray(),
                              bounds.getSouthWest().toArray(),
                            ],
                          ],
                        },
                      },
                    })
                  }
                />
              </>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </FleetPageWrapper>
  );
};

export default ListFleet;
