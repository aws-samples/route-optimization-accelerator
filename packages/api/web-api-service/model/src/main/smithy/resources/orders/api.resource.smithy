$version: "2"

namespace aws.proto.routeoptimizationaccelerator.resources

use aws.proto.routeoptimizationaccelerator.types#InternalFailureError
use aws.proto.routeoptimizationaccelerator.types#NotFoundError
use aws.proto.routeoptimizationaccelerator.types#BadRequestError
use aws.proto.routeoptimizationaccelerator.types#Name
use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#BooleanValue
use aws.proto.routeoptimizationaccelerator.types#IntValue
use aws.proto.routeoptimizationaccelerator.types#PaginatedEntitiesInput
use aws.proto.routeoptimizationaccelerator.types#PaginatedEntitiesOutput


@mixin
structure WithOrderDataParam {
	@required
	data: Order
}

resource OrderResource {
	identifiers: { id: Id }

	create: CreateOrder
	update: UpdateOrder
	read: GetOrder
	list: ListOrders
	delete: DeleteOrder
}


@input
structure CreateOrderInput with [WithOrderDataParam] {}

@output
structure CreateOrderOutput with [WithOrderDataParam] {}


@http(method: "POST", uri: "/order")
operation CreateOrder {
  input: CreateOrderInput
  output: CreateOrderOutput
  errors: [InternalFailureError, BadRequestError]
}

@readonly
@http(method: "GET", uri: "/order/{id}")
operation GetOrder {
  input: GetOrderInput
  output: GetOrderOuput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure GetOrderInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure GetOrderOuput with [WithOrderDataParam] {}

@readonly
@http(method: "GET", uri: "/order")
operation ListOrders {
  input: ListOrdersInput
  output: ListOrdersOutput
  errors: [InternalFailureError]
}

@input
structure ListOrdersInput with [PaginatedEntitiesInput] {}


@output
structure ListOrdersOutput with [PaginatedEntitiesOutput] {
	@required
	data: OrderList
}

@idempotent
@http(method: "PUT", uri: "/order/{id}")
operation UpdateOrder {
  input: UpdateOrderInput
  output: UpdateOrderOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure UpdateOrderInput with [WithOrderDataParam] {	
	@required
  @httpLabel
  id: Id
}

@output
structure UpdateOrderOutput with [WithOrderDataParam] {}


@idempotent
@http(method: "DELETE", uri: "/order/{id}")
operation DeleteOrder {
  input: DeleteOrderInput
  output: DeleteOrderOutput
  errors: [InternalFailureError, NotFoundError]
}

@input
structure DeleteOrderInput {	
	@required
  @httpLabel
  id: Id
}

@output
structure DeleteOrderOutput {
	@required
	deleted: BooleanValue
}
