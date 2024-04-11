/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { PlacePageWrapper } from "..";
import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import PlaceForm from "../../../components/Forms/PlaceForm";
import {
  Place,
  useCreatePlace,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { v4 as uuidv4 } from "uuid";
import { Optional } from "@cloudscape-design/components/internal/types";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { useNavigate } from "react-router-dom";

const NewPlace: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const create = useCreatePlace();

  const savePlace = async (data: Place) => {
    try {
      if (!data.address || !data.type || !data.position || !data.name) {
        setAlert({ type: "warning", message: "All fields are required" });

        return;
      }

      setIsLoading(true);
      const content: Place = {
        ...data,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await create.mutateAsync({
        createPlaceRequestContent: {
          data: content,
        },
      });
      navigate("/place");
    } catch (err) {
      console.log(err);

      setAlert({ type: "error", message: "Error while saving the place" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PlacePageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header>Create a new Place</Header>
            <AlertWrapper alert={alert} />
            <PlaceForm onSave={savePlace} />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </PlacePageWrapper>
  );
};

export default NewPlace;
