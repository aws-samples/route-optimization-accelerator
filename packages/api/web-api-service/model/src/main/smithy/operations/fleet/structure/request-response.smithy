$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#Position
use aws.proto.routeoptimizationaccelerator.types#StringValue
use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#DateTime
use aws.proto.routeoptimizationaccelerator.types#IntList
use aws.proto.routeoptimizationaccelerator.types#Vertices
use aws.proto.routeoptimizationaccelerator.types#Polygon

structure FleetCurrentPositionData {
  @required
  id: Id

  @required
  name: StringValue

  @required
  position: Position
}

structure UpdateFleetCurrentPositionData {
  @required
  position: Position
}

structure FleetPositionHistoryData {
  @required
  id: Id

  @required
  name: StringValue

  @required
  positionHistory: Vertices
}


structure ListFleetPositionsData {
  @required
  polygon: Polygon
}

structure ListFleetPositionsOutputDataMember {
  @required
  id: Id

  @required
  name: StringValue

  @required
  position: IntList

  @required
  time: DateTime
}

list ListFleetPositionsOutputData {
  member: ListFleetPositionsOutputDataMember
}
