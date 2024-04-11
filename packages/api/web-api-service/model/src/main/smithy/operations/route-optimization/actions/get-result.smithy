$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@readonly
@http(method: "GET", uri: "/route-optimization/{id}/result")
operation GetRouteOptimizationResult {
  input: GetRouteOptimizationResultInput
  output: GetRouteOptimizationResultOutput
  errors: [InternalFailureError, BadRequestError, NotFoundError]
}

@input
structure GetRouteOptimizationResultInput {
  @required
  @httpLabel
  id: Id
}

@output
structure GetRouteOptimizationResultOutput with [WithRouteOptimizationResultParam] {}