$version: "2"
namespace aws.proto.routeoptimizationaccelerator

use aws.protocols#restJson1
use aws.proto.routeoptimizationaccelerator.resources#ExternalAPIResource
use aws.proto.routeoptimizationaccelerator.resources#PlaceResource
use aws.proto.routeoptimizationaccelerator.resources#FleetResource
use aws.proto.routeoptimizationaccelerator.resources#OrderResource
use aws.proto.routeoptimizationaccelerator.operations#GetExternalAPISecret
use aws.proto.routeoptimizationaccelerator.operations#CreateRouteOptimization
use aws.proto.routeoptimizationaccelerator.operations#GetRouteOptimization
use aws.proto.routeoptimizationaccelerator.operations#GetRouteOptimizationResult
use aws.proto.routeoptimizationaccelerator.operations#GetRouteOptimizationAssignmentResult
use aws.proto.routeoptimizationaccelerator.operations#ListRouteOptimization
use aws.proto.routeoptimizationaccelerator.operations#GetFleetPositionHistory
use aws.proto.routeoptimizationaccelerator.operations#GetFleetCurrentPosition
use aws.proto.routeoptimizationaccelerator.operations#UpdateFleetCurrentPosition
use aws.proto.routeoptimizationaccelerator.operations#ListFleetPositions
use aws.proto.routeoptimizationaccelerator.operations#ListPlacePositions
use aws.proto.routeoptimizationaccelerator.types#BadRequestError
use aws.proto.routeoptimizationaccelerator.types#NotAuthorizedError
use aws.proto.routeoptimizationaccelerator.types#InternalFailureError


@restJson1
service WebApiService {
    version: "1.0"
    resources: [
      ExternalAPIResource
      PlaceResource
      FleetResource
      OrderResource
    ],
    operations: [
      GetRouteOptimization
      ListRouteOptimization
      CreateRouteOptimization
      GetRouteOptimizationResult
      GetRouteOptimizationAssignmentResult
      GetExternalAPISecret
      GetFleetPositionHistory
      GetFleetCurrentPosition
      UpdateFleetCurrentPosition
      ListFleetPositions
      ListPlacePositions
    ]
    errors: [
      BadRequestError
      NotAuthorizedError
      InternalFailureError
    ]
}