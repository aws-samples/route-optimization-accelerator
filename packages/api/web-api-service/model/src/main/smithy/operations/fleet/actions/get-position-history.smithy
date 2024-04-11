$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#DateTime
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@readonly
@http(method: "GET", uri: "/fleet/{id}/position/history")
operation GetFleetPositionHistory {
  input: GetFleetPositionHistoryInput
  output: GetFleetPositionHistoryOutput
  errors: [InternalFailureError, NotFoundError, BadRequestError]
}

@input
structure GetFleetPositionHistoryInput {
	@required
  @httpLabel
  id: Id

  @httpQuery("from")
  @required
  from: DateTime

  @httpQuery("to")
  @required
  to: DateTime
}

@output
structure GetFleetPositionHistoryOutput {
  @required
  data: FleetPositionHistoryData
}