
namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#DateTime
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError

@idempotent
@http(method: "PUT", uri: "/positions/fleet")
operation ListFleetPositions {
  input: ListFleetPositionsInput
  output: ListFleetPositionsOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure ListFleetPositionsInput {
  @required
  data: ListFleetPositionsData
}

@output
structure ListFleetPositionsOutput {
  @required
  data: ListFleetPositionsOutputData
}
