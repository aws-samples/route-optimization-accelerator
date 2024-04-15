# Optimization Infra

Contains the implementation of some of the Infra components (CDK Constructs) for the [Optimization Service](../../../docs/services/optimization/README.md).

The main construct ([RouteOptimizationEngineInfra](./src/index.ts)) creates the SQS Queue that contains the optimization tasks and the ECS infrastructure to execute them. The ECS tasks scale in and out automatically, based on the queue depth by leveraging the default SQS metrics (`ApproximateNumberOfMessagesVisible` and `ApproximateNumberOfMessagesNotVisible`)
