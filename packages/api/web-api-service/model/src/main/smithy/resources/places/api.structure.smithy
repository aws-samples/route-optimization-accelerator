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
use aws.proto.routeoptimizationaccelerator.types#EntityName

structure Place with [EntityBase,Identifiable,SoftDeleteFlag,EntityName] {
	@required
	@documentation("Define the type of place")
	type: PlaceType

	@required
	@documentation("The address of the place")
	@pattern("^[\\w \\.\\-,;]+$")
	@length(min: 3, max: 1024)
	address: StringValue

	@required
	@documentation("Define the coordinates of the place")
	position: Position
}

list PlaceList {
	member: Place
}
