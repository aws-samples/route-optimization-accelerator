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
- **Optimization**: the Optimization Tasks are sent to an Amazon SQS queue which has a limit of 256kb per message, large optimization task might not be executed due to this limit (though probably they'd be limited in the scalability by the solver constraint esplained above). In future iterations this limit would be removed providing the ability to run arbitrary large tasks.
