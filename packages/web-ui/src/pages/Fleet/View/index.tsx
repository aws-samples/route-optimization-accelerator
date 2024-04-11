/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useCallback, useState } from "react";
import { FleetPageWrapper } from "..";
import {
  Button,
  Container,
  Grid,
  Header,
  Link,
  SpaceBetween,
  Spinner,
  Toggle,
} from "@cloudscape-design/components";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetFleet,
  useGetFleetCurrentPosition,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import AlertWrapper from "../../../components/AlertWrapper";
import { ValueWithLabel } from "../../../components/ValueWithLabel";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import { DEFAULT_CONFIG } from "../../../components/OptimizationConfiguration";
import { Tags } from "../../../components/Tags";
import MapPopover from "../../../components/MapPopover";
import MapWrapper from "../../../components/Map/MapWrapper";
import DateRange from "../../../components/DateRange";
import { useApiClient } from "../../../api/WebApi";
import { Optional } from "../../../utils/common";
import CopyComponent from "../../../components/CopyComponent";

const ViewFleet: React.FC = () => {
  const navigate = useNavigate();
  const [localtionHistory, setLocationHistory] =
    useState<Optional<number[][]>>();
  const { id } = useParams();
  const fleet = useGetFleet({ id: id! });
  const webApi = useApiClient();
  const currentPosition = useGetFleetCurrentPosition({ id: id! });

  const dateUpdater = useCallback(
    (from: Date, to: Date) => {
      (async () => {
        if (from && to) {
          const result = await webApi.getFleetPositionHistory({
            id: id!,
            from: from!.toISOString(),
            to: to!.toISOString(),
          });

          setLocationHistory(result.data.positionHistory);
        }
      })();
    },
    [webApi, id],
  );

  return (
    <FleetPageWrapper isLoading={fleet.isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header
              actions={
                <Button
                  variant="primary"
                  onClick={() => navigate(`/fleet/${id}/edit`)}
                >
                  Edit
                </Button>
              }
            >
              Fleet details {fleet.isLoading ? <Spinner /> : <></>}
            </Header>
            {fleet.isError && (
              <AlertWrapper
                alert={{
                  type: "error",
                  message: "Error loading the fleet member",
                }}
              />
            )}

            <Grid
              gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
            >
              <SpaceBetween size="l">
                <ValueWithLabel label="Id">
                  <CopyComponent
                    text={fleet?.data?.data.id || "-"}
                    textToCopy={fleet?.data?.data.id || "-"}
                    name="Id"
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Preferred Departure Time">
                  {fleet?.data?.data.preferredDepartureTime || "-"}
                </ValueWithLabel>

                <ValueWithLabel label="Attributes">
                  <Tags tags={fleet?.data?.data.attributes} />
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Name">
                  {fleet?.data?.data.name || "-"}
                </ValueWithLabel>

                <ValueWithLabel label="Starting Location">
                  {fleet?.data?.data.startingLocation ? (
                    <MapPopover
                      lat={fleet?.data?.data.startingLocation.latitude}
                      lon={fleet?.data?.data.startingLocation.longitude}
                      markers={[
                        [
                          fleet?.data?.data.startingLocation.longitude,
                          fleet?.data?.data.startingLocation.latitude,
                          {
                            color: "red",
                            popupContent: (
                              <Link
                                href={`/place/${fleet?.data?.data.startingLocation.id}`}
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
                  ) : (
                    "-"
                  )}
                </ValueWithLabel>

                <ValueWithLabel label="Created At">
                  <DateTimeLabel
                    timestamp={fleet?.data?.data.createdAt}
                    mode={DateTimeLabelMode.Relative}
                  />
                </ValueWithLabel>
              </SpaceBetween>
              <SpaceBetween size="l">
                <ValueWithLabel label="Back to origin">
                  <Toggle
                    checked={
                      fleet?.data?.data.backToOrigin !== undefined
                        ? fleet?.data?.data.backToOrigin
                        : DEFAULT_CONFIG.backToOrigin!
                    }
                    disabled
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Active">
                  <Toggle
                    checked={fleet?.data?.data.isActive === "Y"}
                    disabled
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Updated At">
                  <DateTimeLabel
                    timestamp={fleet?.data?.data.updatedAt}
                    mode={DateTimeLabelMode.Relative}
                  />
                </ValueWithLabel>
              </SpaceBetween>
            </Grid>
            <Header variant="h3">Limits</Header>
            <Grid
              gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
            >
              <SpaceBetween size="l">
                <ValueWithLabel label="Max Orders">
                  {fleet?.data?.data.limits?.maxOrders || "-"}
                </ValueWithLabel>

                <ValueWithLabel label="Max Distance">
                  {fleet?.data?.data.limits?.maxDistance || "-"}
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Max Capacity">
                  {fleet?.data?.data.limits?.maxCapacity || "-"}
                </ValueWithLabel>

                <ValueWithLabel label="Max Distance">
                  {fleet?.data?.data.limits?.maxTime || "-"}
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Max Volume">
                  {fleet?.data?.data.limits?.maxVolume || "-"}
                </ValueWithLabel>
              </SpaceBetween>
            </Grid>
            <Header variant="h3">Current Location</Header>
            {currentPosition.isError && (
              <AlertWrapper
                alert={{
                  type: "warning",
                  message:
                    "Unable to retrieve the current position of the vehicle, make sure the data is sent to the tracker via the API successfully",
                }}
              />
            )}
            {currentPosition.isSuccess && (
              <SpaceBetween size="l">
                <ValueWithLabel label="Show historical position">
                  <DateRange onChange={dateUpdater} />
                </ValueWithLabel>
                <MapWrapper
                  style={{ height: "350px" }}
                  lat={currentPosition.data?.data.position.latitude}
                  lon={currentPosition.data?.data.position.longitude}
                  line={localtionHistory}
                  markers={[
                    [
                      currentPosition.data?.data.position.longitude!,
                      currentPosition.data?.data.position.latitude!,
                    ],
                  ]}
                />
              </SpaceBetween>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </FleetPageWrapper>
  );
};

export default ViewFleet;
