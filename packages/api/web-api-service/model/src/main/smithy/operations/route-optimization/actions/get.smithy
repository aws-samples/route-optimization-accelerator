$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@readonly
@http(method: "GET", uri: "/route-optimization/{id}")
operation GetRouteOptimization {
  input: GetRouteOptimizationInput
  output: GetRouteOptimizationOutput
  errors: [InternalFailureError, NotFoundError, BadRequestError]
}

@input
structure GetRouteOptimizationInput {
  @required
  @httpLabel
  id: Id
}

@output
structure GetRouteOptimizationOutput with [WithRouteOptimizationParam] {}