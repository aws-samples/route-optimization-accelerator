$version: "2"

namespace aws.proto.routeoptimizationaccelerator.resources

use aws.proto.routeoptimizationaccelerator.types#EntityBase
use aws.proto.routeoptimizationaccelerator.types#StringValue
use aws.proto.routeoptimizationaccelerator.types#SoftDeleteFlag
use aws.proto.routeoptimizationaccelerator.types#BaseOrder

structure Order with [BaseOrder,EntityBase,SoftDeleteFlag] {
	@required
	@documentation("Alphanumeric value to describe the order number")
	@length(min: 3, max: 64)
	@pattern("^[A-Z0-9_]+$")
	number: StringValue

	@documentation("Order description")
	@length(min: 3, max: 2048)
	@pattern("^[\\s\\S]*$")
	description: StringValue
}

list OrderList {
	member: Order
}
