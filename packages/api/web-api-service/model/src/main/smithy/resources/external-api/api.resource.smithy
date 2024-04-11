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
structure WithExternalAPIDataParam {
	@required
	data: ExternalAPI
}

resource ExternalAPIResource {
	identifiers: { id: Id }

	create: CreateExternalAPI
	update: UpdateExternalAPI
	read: GetExternalAPI
	list: ListExternalAPIs
	delete: DeleteExternalAPI
}


@input
structure CreateExternalAPIInput with [WithExternalAPIDataParam] {}

@output
structure CreateExternalAPIOutput with [WithExternalAPIDataParam] {}


@http(method: "POST", uri: "/external-api")
operation CreateExternalAPI {
  input: CreateExternalAPIInput
  output: CreateExternalAPIOutput
  errors: [InternalFailureError, BadRequestError]
}

@readonly
@http(method: "GET", uri: "/external-api/{id}")
operation GetExternalAPI {
  input: GetExternalAPIInput
  output: GetExternalAPIOuput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure GetExternalAPIInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure GetExternalAPIOuput with [WithExternalAPIDataParam] {}

@readonly
@http(method: "GET", uri: "/external-api")
operation ListExternalAPIs {
  input: ListExternalAPIsInput
  output: ListExternalAPIsOutput
  errors: [InternalFailureError]
}

@input
structure ListExternalAPIsInput with [PaginatedEntitiesInput] {}


@output
structure ListExternalAPIsOutput with [PaginatedEntitiesOutput] {
	@required
	data: ExternalAPIList
}

@idempotent
@http(method: "PUT", uri: "/external-api/{id}")
operation UpdateExternalAPI {
  input: UpdateExternalAPIInput
  output: UpdateExternalAPIOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure UpdateExternalAPIInput with [WithExternalAPIDataParam] {	
	@required
  @httpLabel
  id: Id
}

@output
structure UpdateExternalAPIOutput with [WithExternalAPIDataParam] {}


@idempotent
@http(method: "DELETE", uri: "/external-api/{id}")
operation DeleteExternalAPI {
  input: DeleteExternalAPIInput
  output: DeleteExternalAPIOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure DeleteExternalAPIInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure DeleteExternalAPIOutput {
	@required
	deleted: BooleanValue
}

