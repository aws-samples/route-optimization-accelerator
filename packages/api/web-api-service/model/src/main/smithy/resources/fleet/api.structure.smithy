$version: "2"

namespace aws.proto.routeoptimizationaccelerator.resources

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#EntityBase
use aws.proto.routeoptimizationaccelerator.types#StringValue
use aws.proto.routeoptimizationaccelerator.types#Name
use aws.proto.routeoptimizationaccelerator.types#IntValue
use aws.proto.routeoptimizationaccelerator.types#Identifiable
use aws.proto.routeoptimizationaccelerator.types#SoftDeleteFlag
use aws.proto.routeoptimizationaccelerator.types#PlaceType
use aws.proto.routeoptimizationaccelerator.types#Position
use aws.proto.routeoptimizationaccelerator.types#BaseFleet
use aws.proto.routeoptimizationaccelerator.types#Location
use aws.proto.routeoptimizationaccelerator.types#EntityName

structure Fleet with [EntityBase, BaseFleet, Identifiable, SoftDeleteFlag, EntityName] {
  @required
  @documentation("Define the id and coordinates of the starting location of the vehicle")
  startingLocation: Location
}

list FleetList {
	member: Fleet
}
