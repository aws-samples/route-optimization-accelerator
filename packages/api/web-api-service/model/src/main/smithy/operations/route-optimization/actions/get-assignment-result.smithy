$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@readonly
@http(method: "GET", uri: "/route-optimization/{id}/result/{fleetId}")
operation GetRouteOptimizationAssignmentResult {
  input: GetRouteOptimizationAssignmentResultInput
  output: GetRouteOptimizationAssignmentResultOutput
  errors: [InternalFailureError, BadRequestError, NotFoundError]
}

@input
structure GetRouteOptimizationAssignmentResultInput {
  @required
  @httpLabel
  id: Id

  @required
  @httpLabel
  fleetId: Id
}

@output
structure GetRouteOptimizationAssignmentResultOutput with [WithRouteOptimizationAssignmentResultParam] {}