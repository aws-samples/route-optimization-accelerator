$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#PaginatedEntitiesInput
use aws.proto.routeoptimizationaccelerator.types#PaginatedEntitiesOutput
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError

@readonly
@http(method: "GET", uri: "/route-optimization")
operation ListRouteOptimization {
  input: ListRouteOptimizationInput
  output: ListRouteOptimizationOutput
  errors: [InternalFailureError, BadRequestError]
}

list OptimizationList {
	member: Optimization
}

@input
structure ListRouteOptimizationInput with [PaginatedEntitiesInput] {}

@output
structure ListRouteOptimizationOutput with [PaginatedEntitiesOutput] {
  @required
	data: OptimizationList
}