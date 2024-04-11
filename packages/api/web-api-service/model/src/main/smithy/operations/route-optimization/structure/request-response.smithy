$version: "2"

namespace aws.proto.routeoptimizationaccelerator.operations

use aws.proto.routeoptimizationaccelerator.types#EntityBase
use aws.proto.routeoptimizationaccelerator.types#SoftDeleteFlag
use aws.proto.routeoptimizationaccelerator.types#Identifiable
use aws.proto.routeoptimizationaccelerator.types#Location
use aws.proto.routeoptimizationaccelerator.types#ServiceWindow
use aws.proto.routeoptimizationaccelerator.types#StringValue
use aws.proto.routeoptimizationaccelerator.types#DateTime
use aws.proto.routeoptimizationaccelerator.types#BooleanValue
use aws.proto.routeoptimizationaccelerator.types#FleetLimit
use aws.proto.routeoptimizationaccelerator.types#IntValue
use aws.proto.routeoptimizationaccelerator.types#Double
use aws.proto.routeoptimizationaccelerator.types#Json
use aws.proto.routeoptimizationaccelerator.types#DistanceMatrixType
use aws.proto.routeoptimizationaccelerator.types#OptimizationStatus
use aws.proto.routeoptimizationaccelerator.types#ActiveFlag
use aws.proto.routeoptimizationaccelerator.types#LongValue
use aws.proto.routeoptimizationaccelerator.types#BaseFleet
use aws.proto.routeoptimizationaccelerator.types#ConstraintType
use aws.proto.routeoptimizationaccelerator.types#BaseOrder

@mixin
structure FullLocationAware {
  @required
  @documentation("Define the starting location of the vehicle")
  startingLocation: Location
}

structure OptimizationFleetDetail with [BaseFleet, Identifiable, FullLocationAware] {}

structure OptimizationVirtualFleet with [BaseFleet, FullLocationAware] {
  @required
  @documentation("The number of additional vehicles (virtual) to consider by the solver")
  @range(min: 1)
  size: IntValue

  @required
  @documentation("An identifier for the virtual fleet group")
  @pattern("^[0-9a-zA-Z\\-_]+$")
  groupId: StringValue
}

list OptimizationVirtualFleetList {
  member: OptimizationVirtualFleet
}

list OptimizationFleetList {
  member: OptimizationFleetDetail
}

structure OptimizationOrderDetail with [BaseOrder] {}

list OptimizationOrderList {
  member: OptimizationOrderDetail
}

structure ConstraintData {
  @documentation("Update the type of the constraint")
  type: ConstraintType

  @range(min: 0)
  @default(1)
  @documentation("Define the weight of the constraint, use 0 to disable it")
  weight: IntValue
}

structure OptimizationWeights {
  travelTime: ConstraintData

  travelDistance: ConstraintData

  maxTime: ConstraintData

  maxDistance: ConstraintData

  earlyArrival: ConstraintData

  lateArrival: ConstraintData

  lateDeparture: ConstraintData

  orderCount: ConstraintData

  virtualVehicle: ConstraintData

  vehicleWeight: ConstraintData

  vehicleVolume: ConstraintData

  orderRequirements: ConstraintData
}

structure OptimizationConfiguration {
  @default("ROAD_DISTANCE")
  distanceMatrixType: DistanceMatrixType

  @documentation("Define the global configuration that apply to all fleet member for the maximum amount of orders to handle")
  maxOrders: IntValue

  @documentation("Define the global configuration that apply to all fleet member for the maximum travel distance")
  maxDistance: IntValue

  @documentation("Define the global configuration that apply to all fleet member for the maximum total time (includes travel time, service duration and waiting time)")
  maxTime: IntValue

  @default(false)
  @documentation("Define whether tolls must be avoided or not")
  avoidTolls: BooleanValue

  @default(false)
  @documentation("If true, the result would include explaination of the score")
  explain: BooleanValue

  @default(true)
  @documentation("Define whether it should route back to the origin point once the delivery is completed")
  backToOrigin: BooleanValue

  @default(300)
  @documentation("Define the maximum duration limit for the solver in seconds")
  maxSolverDuration: IntValue

  @default(10)
  @documentation("Define the maximum duration limit when the solver is unable to improve an existing solution")
  maxUnimprovedSolverDuration: IntValue

  @documentation("Define the vehicle departure time to be used as default value")
  vehicleDepartureTime: DateTime

  @documentation("Define the virtual fleet to be used should the one explicitly defined be not enough.")
  virtualFleet: OptimizationVirtualFleetList

  @documentation("Configure the constraints type and weight to be used to change the behaviour of the solver")
  constraints: OptimizationWeights
}

structure ExecutionLogDetails {
  @required
  @documentation("Get the log region")
  region: StringValue

  @required
  @documentation("Get the log group")
  group: StringValue

  @required
  @documentation("Get the log stream")
  stream: StringValue
}

structure ExecutionDetails {
  @required
  @documentation("Retrieve the logs information of the given task execution")
  log: ExecutionLogDetails
}

structure Optimization with [EntityBase, SoftDeleteFlag] {
  @required
  @documentation("The unique UUID of your optimization task")
  @pattern("^[0-9a-f\\-]+$")
  problemId: StringValue
  
  @documentation("List of vehicles that compose your fleet. This can be used to model also staff that has to visit multiple customers")
  @required
  fleet: OptimizationFleetList
  
  @documentation("List of orders to send or customer to visit to accomplish a given task (delivery, maintenance etc)")
  @required
  orders: OptimizationOrderList

  @documentation("Define a custom configuration to personalize the behaviour of the optimization task")
  config: OptimizationConfiguration

  @documentation("Status of the optimization task, it will be returned by the service after the creation")
  status: OptimizationStatus

  @documentation("Details on the task execution")
  executionDetails: ExecutionDetails
}


@mixin
structure WithRouteOptimizationParam {
	@required
	data: Optimization
}

structure ScoreDetails {
  @required
  @documentation("Hard score")
  hard: LongValue
  
  @required
  @documentation("Medium score")
  medium: LongValue
  
  @required
  @documentation("Soft score")
  soft: LongValue
}

structure OptimizationErrorResult {
  @required
  @documentation("Error message")
  errorMessage: StringValue

  @required
  @documentation("Additiona error details")
  errorDetails: StringValue
}

structure OptimizationAssignmentOrderResult {
  @required
  @documentation("The order id")
  id: StringValue

  @required
  @documentation("The arrival time of the vehicle to the order destination")
  arrivalTime: DateTime
}

list OptimizationAssignmentOrderList {
  member: OptimizationAssignmentOrderResult
}

structure OptimizationAssignmentResult {
  @required
  @documentation("The Id of the fleet member that cover this assignment")
  fleetId: StringValue

  @required
  @documentation("Suggested departure time based on order distribution planning")
  departureTime: StringValue

  @required
  @documentation("Set to true if this require a virtual fleet member")
  isVirtual: BooleanValue

  @documentation("The id of the virtual group that the vehicle belongs to (populated only if isVirtual=true)")
  virtualGroupId: StringValue

  @required
  @documentation("Total distance of the assignment, in KMs")
  totalTravelDistance: Double

  @required
  @documentation("Total duration of the assignment, in seconds. Includes service time and waiting time")
  totalTimeDuration: Double

  @required
  @documentation("Total weight of this assignment (available if provided as input, otherwise will be 0)")
  totalWeight: Double

  @required
  @documentation("Total volume of this assignment (available if provided as input, otherwise will be 0)")
  totalVolume: Double

  @required
  @documentation("Orders to cover on this assignment")
  orders: OptimizationAssignmentOrderList
}

list OptimizationAssignmentList {
  member: OptimizationAssignmentResult
}

structure OptimizationResult {
  @required
  @documentation("The unique UUID of your optimization task")
  problemId: StringValue

  @required
  @documentation("Score details of the solver")
  score: ScoreDetails

  @documentation("Time needed by the solver to provide a solution, in seconds")
  solverDuration: LongValue

  @documentation("Only available in case of error. Has details of the runtime error")
  error: OptimizationErrorResult

  @documentation("Contains the assignments detail in case of success execution")
  assignments: OptimizationAssignmentList
}

@mixin
structure WithRouteOptimizationResultParam {
	@required
	data: OptimizationResult
}

@mixin
structure WithRouteOptimizationAssignmentResultParam {
	@required
	data: OptimizationAssignmentResult

  @required
  suggestedRoute: Json
}
