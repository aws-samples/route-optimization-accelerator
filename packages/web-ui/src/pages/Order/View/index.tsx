/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React from "react";
import { OrderPageWrapper } from "..";
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
import { useGetOrder } from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import AlertWrapper from "../../../components/AlertWrapper";
import { ValueWithLabel } from "../../../components/ValueWithLabel";
import { NumberFormatter } from "../../../components/NumberFormatter";
import { Duration } from "../../../components/Duration";
import MapWrapper from "../../../components/Map/MapWrapper";
import { Tags } from "../../../components/Tags";
import {
  DateTimeLabel,
  DateTimeLabelMode,
  InitialRelativeMode,
} from "../../../components/DateTimeLabel";
import CopyComponent from "../../../components/CopyComponent";

const ViewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = useGetOrder({ id: id! });

  return (
    <OrderPageWrapper isLoading={order.isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header
              actions={
                <Button
                  variant="primary"
                  onClick={() => navigate(`/order/${id}/edit`)}
                >
                  Edit
                </Button>
              }
            >
              Order details {order.isLoading ? <Spinner /> : <></>}
            </Header>
            {order.isError && (
              <AlertWrapper
                alert={{ type: "error", message: "Error loading the order" }}
              />
            )}
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
              <SpaceBetween size="l">
                <ValueWithLabel label="Id">
                  <CopyComponent
                    text={order?.data?.data.id || "-"}
                    textToCopy={order?.data?.data.id || "-"}
                    name="Order Id"
                  />
                </ValueWithLabel>

                <ValueWithLabel label="Number">
                  <CopyComponent
                    text={order?.data?.data.number || "-"}
                    textToCopy={order?.data?.data.number || "-"}
                    name="Order Number"
                  />
                </ValueWithLabel>

                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <ValueWithLabel label="Service Times">
                    <Duration
                      value={order?.data?.data.serviceTime}
                      unit="seconds"
                    />
                  </ValueWithLabel>

                  <ValueWithLabel label="Active">
                    <Toggle
                      checked={order?.data?.data.isActive === "Y"}
                      disabled
                    />
                  </ValueWithLabel>
                </Grid>

                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <ValueWithLabel label="From">
                    {order?.data?.data.serviceWindow?.from ? (
                      <DateTimeLabel
                        timestamp={new Date(
                          order?.data?.data.serviceWindow?.from!,
                        ).getTime()}
                        mode={DateTimeLabelMode.Relative}
                        initialRelativeMode={InitialRelativeMode.Absolute}
                      />
                    ) : (
                      "-"
                    )}
                  </ValueWithLabel>
                  <ValueWithLabel label="To">
                    {order?.data?.data.serviceWindow?.to ? (
                      <DateTimeLabel
                        timestamp={new Date(
                          order?.data?.data.serviceWindow?.to!,
                        ).getTime()}
                        mode={DateTimeLabelMode.Relative}
                        initialRelativeMode={InitialRelativeMode.Absolute}
                      />
                    ) : (
                      "-"
                    )}
                  </ValueWithLabel>
                </Grid>

                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <ValueWithLabel label="Weight">
                    <NumberFormatter
                      value={order?.data?.data.attributes?.weight}
                      decimalDigits={2}
                    />
                  </ValueWithLabel>
                  <ValueWithLabel label="Volume">
                    <NumberFormatter
                      value={order?.data?.data.attributes?.volume}
                      decimalDigits={2}
                    />
                  </ValueWithLabel>
                </Grid>

                <ValueWithLabel label="Requirements">
                  <Tags tags={order.data?.data.requirements} />
                </ValueWithLabel>

                <ValueWithLabel label="Description">
                  {order.data?.data.description || "-"}
                </ValueWithLabel>

                <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                  <ValueWithLabel label="Created At">
                    <DateTimeLabel
                      timestamp={order?.data?.data.createdAt}
                      mode={DateTimeLabelMode.Relative}
                    />
                  </ValueWithLabel>
                  <ValueWithLabel label="Updated At">
                    <DateTimeLabel
                      timestamp={order?.data?.data.updatedAt}
                      mode={DateTimeLabelMode.Relative}
                    />
                  </ValueWithLabel>
                </Grid>
              </SpaceBetween>
              <SpaceBetween size="l">
                {order.isSuccess && (
                  <MapWrapper
                    style={{ height: "500px" }}
                    bounds={[
                      [
                        order.data?.data.origin.longitude!,
                        order.data?.data.origin.latitude!,
                      ],
                      [
                        order.data?.data.destination.longitude!,
                        order.data?.data.destination.latitude!,
                      ],
                    ]}
                    markers={[
                      [
                        order.data?.data.origin.longitude,
                        order.data?.data.origin.latitude,
                        {
                          color: "red",
                          popupContent: (
                            <Link
                              href={`/place/${order.data?.data.origin.id}`}
                              target="_blank"
                            >
                              Origin
                            </Link>
                          ),
                        },
                      ],
                      [
                        order.data?.data.destination.longitude,
                        order.data?.data.destination.latitude,
                        {
                          popupContent: (
                            <Link
                              href={`/place/${order.data?.data.destination.id}`}
                              target="_blank"
                            >
                              Destination
                            </Link>
                          ),
                        },
                      ],
                    ]}
                  />
                )}
              </SpaceBetween>
            </Grid>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </OrderPageWrapper>
  );
};

export default ViewOrder;
