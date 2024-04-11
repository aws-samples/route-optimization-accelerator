$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@http(method: "POST", uri: "/route-optimization")
operation CreateRouteOptimization {
  input: CreateRouteOptimizationInput
  output: CreateRouteOptimizationOutput
  errors: [InternalFailureError, BadRequestError]
}


@input
structure CreateRouteOptimizationInput with [WithRouteOptimizationParam] {}

@output
structure CreateRouteOptimizationOutput with [WithRouteOptimizationParam] {}