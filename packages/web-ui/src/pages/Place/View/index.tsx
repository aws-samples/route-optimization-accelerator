/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { PlacePageWrapper } from "..";
import {
  Button,
  Container,
  Grid,
  Header,
  SpaceBetween,
  Spinner,
  Toggle,
} from "@cloudscape-design/components";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPlace } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import AlertWrapper from "../../../components/AlertWrapper";
import { ValueWithLabel } from "../../../components/ValueWithLabel";
import { capitalizeFirstLetter } from "../../../utils/common";
import MapWrapper from "../../../components/Map/MapWrapper";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import CopyComponent from "../../../components/CopyComponent";

const ViewPlace: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const place = useGetPlace({ id: id! });

  return (
    <PlacePageWrapper isLoading={place.isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header
              actions={
                <Button
                  variant="primary"
                  onClick={() => navigate(`/place/${id}/edit`)}
                >
                  Edit
                </Button>
              }
            >
              Place details {place.isLoading ? <Spinner /> : <></>}
            </Header>
            {place.isError && (
              <AlertWrapper
                alert={{ type: "error", message: "Error loading the place" }}
              />
            )}
            <Grid
              gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}
            >
              <SpaceBetween size="l">
                <ValueWithLabel label="Id">
                  <CopyComponent
                    text={place?.data?.data.id || "-"}
                    textToCopy={place?.data?.data.id || "-"}
                    name="Id"
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Created At">
                  <DateTimeLabel
                    timestamp={place?.data?.data.createdAt}
                    mode={DateTimeLabelMode.Relative}
                  />
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Name">
                  {place?.data?.data.name || "-"}
                </ValueWithLabel>

                <ValueWithLabel label="Updated At">
                  <DateTimeLabel
                    timestamp={place?.data?.data.updatedAt}
                    mode={DateTimeLabelMode.Relative}
                  />
                </ValueWithLabel>
              </SpaceBetween>

              <SpaceBetween size="l">
                <ValueWithLabel label="Type">
                  {capitalizeFirstLetter(
                    place?.data?.data.type.toLocaleLowerCase(),
                  ) || "-"}
                </ValueWithLabel>

                <ValueWithLabel label="Active">
                  <Toggle
                    checked={place?.data?.data.isActive === "Y"}
                    disabled
                  />
                </ValueWithLabel>
              </SpaceBetween>
            </Grid>

            <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
              <SpaceBetween size="l">
                <ValueWithLabel label="Address">
                  {place?.data?.data.address || "-"}
                </ValueWithLabel>
                {place.isSuccess && (
                  <MapWrapper
                    zoom={15}
                    lat={place.data?.data.position.latitude}
                    lon={place.data?.data.position.longitude}
                    markers={[
                      [
                        place!.data!.data!.position!.longitude!,
                        place!.data!.data!.position!.latitude!,
                        { color: "red", popupContent: <>Place</> },
                      ],
                    ]}
                    style={{ width: "100%", height: "400px" }}
                  />
                )}
              </SpaceBetween>
            </Grid>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </PlacePageWrapper>
  );
};

export default ViewPlace;
