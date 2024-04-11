$version: "2"
namespace aws.proto.routeoptimizationaccelerator.types

double Double
double DegreeAngle

string StringValue
string Id
string Name

string DateTime

boolean BooleanValue

document Json

integer IntValue

long LongValue
long Timestamp

float FloatValue

@mixin
structure PaginatedEntitiesInput {
	@httpQuery("limit")
  limit: IntValue

	@httpQuery("exclusiveStartKey")
  exclusiveStartKey: StringValue

	@httpQuery("name")
	name: Name
}

structure PaginationDetails {
  @required
  pageSize: IntValue
  
  lastEvaluatedKey: StringValue
}

@mixin
structure PaginatedEntitiesOutput {
  @required
  pagination: PaginationDetails
}

@mixin
structure EntityBase {
	@required
  createdAt: Timestamp

  @required
  updatedAt: Timestamp
}

@mixin
structure SoftDeleteFlag {
  @documentation("Flag that define wether the item is still active or has been deleted (soft delete flag)")
	isActive: ActiveFlag
}

@mixin
structure Identifiable {
  @required
  @pattern("^[0-9a-zA-Z\\-]+$")
  id: Id
}

@mixin
structure EntityName {
	@required
	@documentation("A descriptive name for this entity")
	@pattern("^[\\w][#\\w \\.-]*$")
  @length(min: 3, max: 64)
	name: Name
}

@mixin
structure Coordinates {
  @required
  latitude: DegreeAngle

  @required
  longitude: DegreeAngle
}

structure Location with [Coordinates, Identifiable] {}

structure Position with [Coordinates] {}

structure ServiceWindow {
  @required
  @documentation("The date from which this order can be delivered")
  from: DateTime

  @required
  @documentation("The date when the order delivery window ends")
  to: DateTime
}

@mixin
structure BaseOrder with [Identifiable] {
  @required
  @documentation("Define where the order originates from (e.g warehouse location)")
  origin: Location

  @required
  @documentation("Define the destination of the order (e.g. customer location)")
  destination: Location

  @default(0)
  @range(min: 0)
  @documentation("Define the service time, in seconds, to handle this order at the destination")
  serviceTime: IntValue

  @documentation("Define the service window for this order (e.g. delivery window)")
  serviceWindow: ServiceWindow

  @documentation("Define the attributes of this order (e.g. weight and volume)")
  attributes: OrderAttributes

  @documentation("Define custom attributes of the order. Useful to be dispatched by specific vehicle matching with the same attributes")
  requirements: StringList
}

structure OrderAttributes {
  @range(min: 0)
  @documentation("The total weight of this order")
  weight: Double

  @range(min: 0)
  @documentation("The total volume of this order")
  volume: Double
}

structure FleetLimit {
  @documentation("Define the maximum amount of orders that could be handled by this member. Overrides global configuration if any")
  @range(min: 1)
  maxOrders: IntValue

  @documentation("Define the maximum travel distance that could be handled by this member. Overrides global configuration if any")
  @range(min: 1)
  maxDistance: IntValue

  @documentation("Define the maximum travel time that could be handled by this member. Overrides global configuration if any")
  @range(min: 1)
  maxTime: IntValue

  @documentation("Define the maximum load capacity of the vehicle (e.g. in Kg)")
  @range(min: 1)
  maxCapacity: Double

  @documentation("Define the maximum load volume of the vehicle (e.g. m3)")
  @range(min: 1)
  maxVolume: Double
}

list StringList {
  @length(min: 1, max: 32)
  @pattern("^\\w+$")
  member: StringValue
}

list IntList {
  member: IntValue
}

enum DistanceMatrixType {
  AIR_DISTANCE = "AIR_DISTANCE"
  ROAD_DISTANCE = "ROAD_DISTANCE"
}

enum OptimizationStatus {
  PENDING = "PENDING"
  IN_PROGRESS = "IN_PROGRESS"
  ERROR = "ERROR"
  WARNING = "WARNING"
  SUCCESS = "SUCCESS"
}

enum ActiveFlag {
  YES = "Y"
  NO = "N"
}

enum PlaceType {
  DEPOT = "DEPOT"
  LOCATION = "LOCATION"
}

@mixin
structure BaseFleet {
  @documentation("Define the preferred departure time of the vehicle")
  @length(min: 5, max: 20)
  preferredDepartureTime: DateTime

  @default(true)
  @documentation("Define whether it should route back to the origin point once the delivery is completed. Overrides global configuration if any")
  backToOrigin: BooleanValue

  @documentation("Define fleet limits")
  limits: FleetLimit

  @documentation("Define custom attributes of the vehicle/personnel. Useful to filter down orders based on their requirements")
  attributes: StringList
}

list Vertices {
  member: IntList
}

list Polygon {
  member: Vertices
}

enum ConstraintType {
  HARD = "Hard"
  MEDIUM = "Medium"
  SOFT = "Soft"
}
