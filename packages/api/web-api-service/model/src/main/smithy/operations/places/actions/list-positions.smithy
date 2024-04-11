
namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError

@idempotent
@http(method: "PUT", uri: "/positions/place")
operation ListPlacePositions {
  input: ListPlacePositionsInput
  output: ListPlacePositionsOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure ListPlacePositionsInput {
  @required
  data: ListPlacePositionsData
}

@output
structure ListPlacePositionsOutput {
  @required
  data: ListPlacePositionsOutputData
}
