/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { PlacePageWrapper } from "..";
import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import PlaceForm from "../../../components/Forms/PlaceForm";
import { Optional } from "@cloudscape-design/components/internal/types";
import { useNavigate, useParams } from "react-router-dom";
import {
  Place,
  useGetPlace,
  useUpdatePlace,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";

const EditPlace: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const [isLoading, setIsLoading] = useState(false);
  const place = useGetPlace({ id: id! });
  const update = useUpdatePlace();

  const savePlace = async (data: Place) => {
    try {
      if (!data.address || !data.type || !data.position || !data.name) {
        setAlert({ type: "warning", message: "All fields are required" });

        return;
      }

      setIsLoading(true);
      const content: Place = {
        ...data,
        updatedAt: Date.now(),
      };

      await update.mutateAsync({
        id: id!,
        updatePlaceRequestContent: {
          data: content,
        },
      });
      navigate("/place/" + id);
    } catch (err) {
      console.log(err);

      setAlert({ type: "error", message: "Error while updating the place" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PlacePageWrapper isLoading={place.isLoading || isLoading}>
      <SpaceBetween size="l">
        <SpaceBetween size="l">
          <Container>
            <SpaceBetween size="l">
              <Header>Update a Place</Header>
              <AlertWrapper
                alert={
                  place.isError
                    ? { type: "error", message: "Error loading the place" }
                    : alert
                }
              />
              <PlaceForm onSave={savePlace} place={place.data?.data} />
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </SpaceBetween>
    </PlacePageWrapper>
  );
};

export default EditPlace;
