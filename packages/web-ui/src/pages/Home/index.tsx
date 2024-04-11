/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Box,
  Container,
  ContentLayout,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";

const Home: React.FC = () => {
  return (
    <ContentLayout header={<Header>Home</Header>}>
      <SpaceBetween size="l">
        <Container header={<Header>Route Optimization Accelerator</Header>}>
          <Box variant="p">
            Use the navigation menu to explore the section of the application
            and create your entities. After you create places, fleet and orders
            you can start creating optimization tasks that help you solve
            vehicle routing and travelling salesman problems.
          </Box>
          <Box variant="p">
            You can include constraints that cover delivery windows, capacity
            limits and time and distance limits. The optimization task would
            take into account the constraints that you define and provide a
            viable solution for your optimization problems.
          </Box>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
};

export default Home;
