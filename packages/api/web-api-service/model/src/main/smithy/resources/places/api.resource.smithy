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
structure WithPlaceDataParam {
	@required
	data: Place
}

resource PlaceResource {
	identifiers: { id: Id }

	create: CreatePlace
	update: UpdatePlace
	read: GetPlace
	list: ListPlaces
	delete: DeletePlace
}


@input
structure CreatePlaceInput with [WithPlaceDataParam] {}

@output
structure CreatePlaceOutput with [WithPlaceDataParam] {}


@http(method: "POST", uri: "/place")
operation CreatePlace {
  input: CreatePlaceInput
  output: CreatePlaceOutput
  errors: [InternalFailureError, BadRequestError]
}

@readonly
@http(method: "GET", uri: "/place/{id}")
operation GetPlace {
  input: GetPlaceInput
  output: GetPlaceOuput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure GetPlaceInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure GetPlaceOuput with [WithPlaceDataParam] {}

@readonly
@http(method: "GET", uri: "/place")
operation ListPlaces {
  input: ListPlacesInput
  output: ListPlacesOutput
  errors: [InternalFailureError]
}

@input
structure ListPlacesInput with [PaginatedEntitiesInput] {}


@output
structure ListPlacesOutput with [PaginatedEntitiesOutput] {
	@required
	data: PlaceList
}

@idempotent
@http(method: "PUT", uri: "/place/{id}")
operation UpdatePlace {
  input: UpdatePlaceInput
  output: UpdatePlaceOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure UpdatePlaceInput with [WithPlaceDataParam] {	
	@required
  @httpLabel
  id: Id
}

@output
structure UpdatePlaceOutput with [WithPlaceDataParam] {}


@idempotent
@http(method: "DELETE", uri: "/place/{id}")
operation DeletePlace {
  input: DeletePlaceInput
  output: DeletePlaceOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure DeletePlaceInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure DeletePlaceOutput {
	@required
	deleted: BooleanValue
}
