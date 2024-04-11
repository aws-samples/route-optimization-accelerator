/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { OrderPageWrapper } from "..";
import {
  Button,
  Container,
  Icon,
  Link,
  SpaceBetween,
} from "@cloudscape-design/components";
import {
  Order,
  ListOrdersResponseContent,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useApiClient } from "../../../api/WebApi";
import { useNavigate } from "react-router-dom";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import MapPopover from "../../../components/MapPopover";
import CommonTable from "../../../components/CommonTable";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { Optional } from "@cloudscape-design/components/internal/types";
import { Duration } from "../../../components/Duration";

const ListOrders: React.FC = () => {
  const navigate = useNavigate();
  const webApi = useApiClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();

  const createNewOrder = () => navigate("/order/new");

  return (
    <OrderPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <AlertWrapper alert={alert} />
            <CommonTable<Order, ListOrdersResponseContent>
              headerText="Orders"
              idPropertyName="id"
              missingItemsText="No order found"
              loadingText="Loading orders"
              filterText="Search order by number"
              createNewTextEmptyBox="Create a new Order"
              onError={(message) => setAlert({ type: "error", message })}
              onLoadingChange={(loading) => setIsLoading(loading)}
              onCreateNew={createNewOrder}
              headerActions={
                <Button variant="primary" onClick={createNewOrder}>
                  Create New
                </Button>
              }
              columndDefinition={[
                {
                  id: "number",
                  header: "Number",
                  cell: (e) => e.number,
                },
                {
                  id: "origin",
                  header: "Origin",
                  cell: (e) => (
                    <MapPopover
                      lat={e.origin.latitude}
                      lon={e.origin.longitude}
                      markers={[
                        [
                          e.origin.longitude,
                          e.origin.latitude,
                          {
                            color: "red",
                            popupContent: (
                              <Link
                                href={`/place/${e.origin.id}`}
                                target="_blank"
                              >
                                Order Origin
                              </Link>
                            ),
                          },
                        ],
                      ]}
                    >
                      Origin
                    </MapPopover>
                  ),
                },
                {
                  id: "destination",
                  header: "Destination",
                  cell: (e) => (
                    <MapPopover
                      lat={e.destination.latitude}
                      lon={e.destination.longitude}
                      markers={[
                        [
                          e.destination.longitude,
                          e.destination.latitude,
                          {
                            color: "red",
                            popupContent: (
                              <Link
                                href={`/place/${e.destination.id}`}
                                target="_blank"
                              >
                                Order Destination
                              </Link>
                            ),
                          },
                        ],
                      ]}
                    >
                      Destination
                    </MapPopover>
                  ),
                },
                {
                  id: "serviceTime",
                  header: "Service time",
                  cell: (e) => (
                    <Duration value={e.serviceTime} unit="seconds" />
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
                      <Link onFollow={() => navigate(`${e.id}`)}>Details</Link>{" "}
                      | <Icon name="edit" />{" "}
                      <Link onFollow={() => navigate(`${e.id}/edit`)}>
                        Edit
                      </Link>
                    </>
                  ),
                },
              ]}
              fetchFunction={(lastEvaluatedKey, filterText) =>
                webApi.listOrders({
                  exclusiveStartKey: lastEvaluatedKey,
                  name: filterText,
                })
              }
            />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </OrderPageWrapper>
  );
};

export default ListOrders;
