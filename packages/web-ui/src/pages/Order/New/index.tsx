/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { OrderPageWrapper } from "..";
import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import {
  Order,
  useCreateOrder,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { v4 as uuidv4 } from "uuid";
import { Optional } from "@cloudscape-design/components/internal/types";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { useNavigate } from "react-router-dom";
import OrderForm from "../../../components/Forms/OrderForm";

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const create = useCreateOrder();

  const saveOrder = async (data: Order) => {
    try {
      if (!data.number || !data.origin || !data.destination) {
        setAlert({
          type: "warning",
          message: "Order number, origin and destination are required fields",
        });

        return;
      }

      setIsLoading(true);
      const content: Order = {
        ...data,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await create.mutateAsync({
        createOrderRequestContent: {
          data: content,
        },
      });
      navigate("/order");
    } catch (err) {
      console.log(err);

      setAlert({ type: "error", message: "Error while saving the order" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderPageWrapper isLoading={isLoading}>
      <SpaceBetween size="l">
        <Container>
          <SpaceBetween size="l">
            <Header>Create a new Order</Header>
            <AlertWrapper alert={alert} />
            <OrderForm onSave={saveOrder} />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </OrderPageWrapper>
  );
};

export default NewOrder;
