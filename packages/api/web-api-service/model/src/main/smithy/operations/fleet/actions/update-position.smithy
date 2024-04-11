$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@idempotent
@http(method: "PUT", uri: "/fleet/{id}/position")
operation UpdateFleetCurrentPosition {
  input: UpdateFleetCurrentPositionInput
  output: UpdateFleetCurrentPositionOutput
  errors: [InternalFailureError, NotFoundError, BadRequestError]
}

@input
structure UpdateFleetCurrentPositionInput {
	@required
  @httpLabel
  id: Id

  @required
  data: UpdateFleetCurrentPositionData
}

@output
structure UpdateFleetCurrentPositionOutput {
  @required
  data: FleetCurrentPositionData
}
