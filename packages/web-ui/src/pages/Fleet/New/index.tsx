/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { FleetPageWrapper } from "..";
import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import FleetForm from "../../../components/Forms/FleetForm";
import {
  Fleet,
  useCreateFleet,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useNavigate } from "react-router-dom";
import { Optional } from "../../../utils/common";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { v4 as uuidv4 } from "uuid";

const NewFleet: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const create = useCreateFleet();

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
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await create.mutateAsync({
        createFleetRequestContent: {
          data: content,
        },
      });

      navigate("/fleet");
    } catch (err) {
      console.log(err);

      setAlert({ type: "error", message: "Error while saving the place" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FleetPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header>Create a new Fleet member</Header>
            <AlertWrapper alert={alert} />
            <FleetForm onSave={saveFleet} />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </FleetPageWrapper>
  );
};

export default NewFleet;
