/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import React, { useState } from "react";
import { OrderPageWrapper } from "..";
import { Container, Header, SpaceBetween } from "@cloudscape-design/components";
import AlertWrapper, { AlertContent } from "../../../components/AlertWrapper";
import { Optional } from "@cloudscape-design/components/internal/types";
import { useNavigate, useParams } from "react-router-dom";
import {
  Order,
  useGetOrder,
  useUpdateOrder,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import OrderForm from "../../../components/Forms/OrderForm";

const EditOrder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [alert, setAlert] = useState<Optional<AlertContent>>();
  const [isLoading, setIsLoading] = useState(false);
  const order = useGetOrder({ id: id! });
  const update = useUpdateOrder();

  const saveOrder = async (data: Order) => {
    try {
      if (!data.number || !data.origin || !data.destination) {
        setAlert({
          type: "warning",
          message: "Order number, origin and destiantion are required fields",
        });

        return;
      }

      setIsLoading(true);
      const content: Order = {
        ...data,
        updatedAt: Date.now(),
      };

      await update.mutateAsync({
        id: id!,
        updateOrderRequestContent: {
          data: content,
        },
      });
      navigate("/order/" + id);
    } catch (err) {
      console.log(err);

      setAlert({ type: "error", message: "Error while updating the order" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderPageWrapper isLoading={order.isLoading || isLoading}>
      <SpaceBetween size="l">
        <SpaceBetween size="l">
          <Container>
            <SpaceBetween size="l">
              <Header>Update an Order</Header>
              <AlertWrapper
                alert={
                  order.isError
                    ? { type: "error", message: "Error loading the order" }
                    : alert
                }
              />
              <OrderForm onSave={saveOrder} order={order.data?.data} />
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </SpaceBetween>
    </OrderPageWrapper>
  );
};

export default EditOrder;
