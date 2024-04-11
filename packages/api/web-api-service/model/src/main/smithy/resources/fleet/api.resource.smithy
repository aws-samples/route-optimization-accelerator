$version: "2"

namespace aws.proto.routeoptimizationaccelerator.resources

use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError
use aws.proto.routeoptimizationaccelerator.types#Name
use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#BooleanValue
use aws.proto.routeoptimizationaccelerator.types#IntValue
use aws.proto.routeoptimizationaccelerator.types#PaginatedEntitiesInput
use aws.proto.routeoptimizationaccelerator.types#PaginatedEntitiesOutput

@mixin
structure WithFleetDataParam {
	@required
	data: Fleet
}

resource FleetResource {
	identifiers: { id: Id }

	create: CreateFleet
	update: UpdateFleet
	read: GetFleet
	list: ListFleet
	delete: DeleteFleet
}


@input
structure CreateFleetInput with [WithFleetDataParam] {}

@output
structure CreateFleetOutput with [WithFleetDataParam] {}


@http(method: "POST", uri: "/fleet")
operation CreateFleet {
  input: CreateFleetInput
  output: CreateFleetOutput
  errors: [InternalFailureError, BadRequestError]
}

@readonly
@http(method: "GET", uri: "/fleet/{id}")
operation GetFleet {
  input: GetFleetInput
  output: GetFleetOuput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure GetFleetInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure GetFleetOuput with [WithFleetDataParam] {}

@readonly
@http(method: "GET", uri: "/fleet")
operation ListFleet {
  input: ListFleetInput
  output: ListFleetOutput
  errors: [InternalFailureError]
}

@input
structure ListFleetInput with [PaginatedEntitiesInput] {}


@output
structure ListFleetOutput with [PaginatedEntitiesOutput] {
	@required
	data: FleetList
}

@idempotent
@http(method: "PUT", uri: "/fleet/{id}")
operation UpdateFleet {
  input: UpdateFleetInput
  output: UpdateFleetOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure UpdateFleetInput with [WithFleetDataParam] {	
	@required
  @httpLabel
  id: Id
}

@output
structure UpdateFleetOutput with [WithFleetDataParam] {}


@idempotent
@http(method: "DELETE", uri: "/fleet/{id}")
operation DeleteFleet {
  input: DeleteFleetInput
  output: DeleteFleetOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure DeleteFleetInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure DeleteFleetOutput {
	@required
	deleted: BooleanValue
}
