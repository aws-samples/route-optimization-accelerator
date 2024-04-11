/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { FleetPageWrapper } from "..";
import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { useNavigate, useParams } from "react-router-dom";
import { Optional } from "../../../utils/common";
import {
  Fleet,
  useGetFleet,
  useUpdateFleet,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import FleetForm from "../../../components/Forms/FleetForm";

const EditFleet: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const [isLoading, setIsLoading] = useState(false);
  const fleet = useGetFleet({ id: id! });
  const update = useUpdateFleet();

  const saveFleet = async (data: Fleet) => {
    try {
      if (!data.name || !data.startingLocation) {
        setAlert({
          type: "warning",
          message: "Name and starting location are required fields",
        });

        return;
      }

      setIsLoading(true);
      const content: Fleet = {
        ...data,
        updatedAt: Date.now(),
      };

      await update.mutateAsync({
        id: id!,
        updateFleetRequestContent: {
          data: content,
        },
      });
      navigate("/fleet/" + id);
    } catch (err) {
      console.log(err);

      setAlert({
        type: "error",
        message: "Error while updating the fleet member",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FleetPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header>Update a Fleet member</Header>
            <AlertWrapper
              alert={
                fleet.isError
                  ? { type: "error", message: "Error loading the fleet member" }
                  : alert
              }
            />
            <FleetForm onSave={saveFleet} fleet={fleet.data?.data} />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </FleetPageWrapper>
  );
};

export default EditFleet;
