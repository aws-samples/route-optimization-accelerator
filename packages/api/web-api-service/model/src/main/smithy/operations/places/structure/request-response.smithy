$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#StringValue
use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#DateTime
use aws.proto.routeoptimizationaccelerator.types#IntList
use aws.proto.routeoptimizationaccelerator.types#Polygon

structure ListPlacePositionsData {
  @required
  polygon: Polygon
}

structure ListPlacePositionsOutputDataMember {
  @required
  id: Id

  @required
  name: StringValue

  @required
  position: IntList

  @required
  time: DateTime
}

list ListPlacePositionsOutputData {
  member: ListPlacePositionsOutputDataMember
}
