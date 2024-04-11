$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.resources#WithExternalAPIDataParam

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError

@readonly
@http(method: "GET", uri: "/external-api/{id}/secret")
operation GetExternalAPISecret {
  input: GetExternalAPISecretInput
  output: GetExternalAPISecretOuput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure GetExternalAPISecretInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure GetExternalAPISecretOuput with [WithExternalAPIDataParam] {}
