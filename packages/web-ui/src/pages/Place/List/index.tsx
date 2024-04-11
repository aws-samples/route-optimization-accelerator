/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { PlacePageWrapper } from "..";
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
} from "@cloudscape-design/components";
import {
  Place,
  ListPlacesResponseContent,
  ListPlacePositionsOutputDataMember,
  ListPlacePositionsResponseContent,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useApiClient } from "../../../api/WebApi";
import { useNavigate } from "react-router-dom";
import {
  SELECTABLE_VIEWS_OPTIONS,
  ViewOptionType,
  capitalizeFirstLetter,
} from "../../../utils/common";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import MapPopover from "../../../components/MapPopover";
import CommonTable from "../../../components/CommonTable";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { Optional } from "@cloudscape-design/components/internal/types";
import { DeleteConfirmationDialog } from "@aws-northstar/ui";
import CommonMap from "../../../components/CommonMap";

const ListPlaces: React.FC = () => {
  const navigate = useNavigate();
  const webApi = useApiClient();
  const [selectedView, setSelectedView] = useState(ViewOptionType.table);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const [mapAlert, setMapAlert] = useState<Optional<AlertContent>>();
  const [selection, setSelection] = useState<Optional<Place[]>>();
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);

  const createNewPlace = () => navigate("/place/new");

  const deleteElements = async () => {
    const execute = (id: string) =>
      webApi.deletePlace({
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
    <PlacePageWrapper isLoading={isLoading}>
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
              This will delete the following places:
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
                <CommonTable<Place, ListPlacesResponseContent>
                  headerText="Places"
                  idPropertyName="id"
                  missingItemsText="No place found"
                  loadingText="Loading places"
                  filterText="Search place by name"
                  createNewTextEmptyBox="Create a new Place"
                  onError={(message) => setAlert({ type: "error", message })}
                  onLoadingChange={(loading) => setIsLoading(loading)}
                  onCreateNew={createNewPlace}
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
                      <Button variant="primary" onClick={createNewPlace}>
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
                      id: "address",
                      header: "Address",
                      cell: (e) => e.address,
                    },
                    {
                      id: "type",
                      header: "Type",
                      cell: (e) =>
                        capitalizeFirstLetter(e.type.toLocaleLowerCase()),
                    },
                    {
                      id: "position",
                      header: "Position",
                      cell: (e) => (
                        <MapPopover
                          lat={e.position.latitude}
                          lon={e.position.longitude}
                          markers={[
                            [
                              e.position.longitude,
                              e.position.latitude,
                              {
                                color: "red",
                                popupContent: <>Place Location</>,
                              },
                            ],
                          ]}
                        >
                          Position
                        </MapPopover>
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
                    webApi.listPlaces({
                      exclusiveStartKey: lastEvaluatedKey,
                      name: filterText,
                    })
                  }
                />
              </>
            )}
            {selectedView === ViewOptionType.map && (
              <>
                <AlertWrapper alert={mapAlert} />
                <CommonMap<
                  ListPlacePositionsOutputDataMember,
                  ListPlacePositionsResponseContent
                >
                  displayData={(q) => ({
                    popupContent: (
                      <Box>
                        <strong>Place:</strong>{" "}
                        <a
                          target="_blank"
                          href={`/place/${q.id}`}
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
                    webApi.listPlacePositions({
                      listPlacePositionsRequestContent: {
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
    </PlacePageWrapper>
  );
};

export default ListPlaces;
