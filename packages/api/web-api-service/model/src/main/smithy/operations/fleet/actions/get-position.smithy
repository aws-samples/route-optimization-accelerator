$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@readonly
@http(method: "GET", uri: "/fleet/{id}/position")
operation GetFleetCurrentPosition {
  input: GetFleetCurrentPositionInput
  output: GetFleetCurrentPositionOutput
  errors: [InternalFailureError, NotFoundError, BadRequestError]
}

@input
structure GetFleetCurrentPositionInput {
	@required
  @httpLabel
  id: Id
}

@output
structure GetFleetCurrentPositionOutput {
  @required
  data: FleetCurrentPositionData
}