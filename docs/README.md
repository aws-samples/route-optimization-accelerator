# Documentation

In this section you can find additional documentation to the components that this accelerator implements.

## Services

- [External API](./services/external-api/README.md)
- [Fleet](./services/fleet/README.md)
- [Order](./services/order/README.md)
- [Place](./services/place/README.md)
- [Optimization](./services/optimization/README.md)

## Additional Documentation

- [API Schema](./api/index.html)

## Limits

- **Solver**: This accelerator leverage [Timefold Solver Community Edition](https://github.com/TimefoldAI/timefold-solver) which does not include key features that are available only on the Enterprise Edition.
- **Distance Matrix**: The accelerator uses Amazon Location Service to compute the distance matrix which is required to run the route optimization engine tasks. The AWS service has [default quotas](https://docs.aws.amazon.com/location/latest/developerguide/location-quotas.html) which would impact the number of parallel API call that can be executed to the `CalculateRouteMatrix` API. This default limit is configured in the code through a `TimedSemaphore` in the [LocationHelper](../packages/route-optimization/optimization-engine/src/main/java/aws/proto/routeoptimizationaccelerator/aws/LocationHelper.java) class, which prevent from sending too many parallel requests to the API. You can update the semaphore to match your current limit if required.
- **Optimization**: the Optimization Tasks are sent to an Amazon SQS queue which has a limit of 256kb per message, large optimization task might not be executed due to this limit (though probably they'd be limited in the scalability by the solver constraint esplained above). In future iterations this limit would be removed providing the ability to run arbitrary large tasks.
