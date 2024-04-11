/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { OptimizationPageWrapper } from "../";
import {
  Button,
  Container,
  Icon,
  Link,
  SpaceBetween,
} from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import {
  Optimization,
  ListRouteOptimizationResponseContent,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import {
  DateTimeLabel,
  DateTimeLabelMode,
} from "../../../components/DateTimeLabel";
import { OptimizationStatus } from "../../../components/OptimizationStatus";
import { useApiClient } from "../../../api/WebApi";
import { Optional } from "../../../utils/common";
import CommonTable from "../../../components/CommonTable";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";

const ListOptimizations: React.FC = () => {
  const navigate = useNavigate();
  const webApi = useApiClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();

  const createNewOptimizationTask = () => navigate("/optimization/new");

  return (
    <OptimizationPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <AlertWrapper alert={alert} />
            <CommonTable<Optimization, ListRouteOptimizationResponseContent>
              headerText="Route Optimization Tasks"
              idPropertyName="problemId"
              missingItemsText="No optimization tasks"
              loadingText="Loading optimization tasks"
              filterText="Search optimization by problem id"
              createNewTextEmptyBox="Create a new optimization task"
              onError={(message) => setAlert({ type: "error", message })}
              onLoadingChange={(loading) => setIsLoading(loading)}
              onCreateNew={createNewOptimizationTask}
              headerActions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="primary" onClick={createNewOptimizationTask}>
                    Create New
                  </Button>
                </SpaceBetween>
              }
              columndDefinition={[
                {
                  id: "id",
                  header: "Problem Id",
                  cell: (e) => e.problemId,
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (e) => <OptimizationStatus status={e.status!} />,
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
                  id: "updatedAt",
                  header: "Updated",
                  cell: (e) => (
                    <DateTimeLabel
                      allowDateFlipping={false}
                      timestamp={e.updatedAt}
                      mode={DateTimeLabelMode.Relative}
                    />
                  ),
                },
                {
                  id: "orders",
                  header: "# orders",
                  cell: (e) => e.orders.length,
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: (e) => (
                    <>
                      <Icon name="file-open" />{" "}
                      <Link onFollow={() => navigate(`${e.problemId}`)}>
                        Details
                      </Link>
                    </>
                  ),
                },
              ]}
              fetchFunction={(lastEvaluatedKey, filterText) =>
                webApi.listRouteOptimization({
                  exclusiveStartKey: lastEvaluatedKey,
                  name: filterText,
                })
              }
            />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </OptimizationPageWrapper>
  );
};

export default ListOptimizations;
