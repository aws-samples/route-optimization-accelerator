$version: "2"

namespace aws.proto.routeoptimizationaccelerator.resources

use aws.proto.routeoptimizationaccelerator.types#Id
use aws.proto.routeoptimizationaccelerator.types#EntityBase
use aws.proto.routeoptimizationaccelerator.types#StringValue
use aws.proto.routeoptimizationaccelerator.types#Name
use aws.proto.routeoptimizationaccelerator.types#IntValue
use aws.proto.routeoptimizationaccelerator.types#Identifiable
use aws.proto.routeoptimizationaccelerator.types#BooleanValue
use aws.proto.routeoptimizationaccelerator.types#SoftDeleteFlag
use aws.proto.routeoptimizationaccelerator.types#EntityName

structure ExternalAPI with [EntityBase,Identifiable,SoftDeleteFlag,EntityName] {
	@required
	@documentation("Define whether it's enabled or not")
	enabled: BooleanValue

	@required
	@documentation("Define the duration of the token in days, up to 365")
	validFor: IntValue

	@documentation("Client ID of the external API")
	clientId: StringValue

	@documentation("API-Key to use by the consumer for this external API")
	apiKey: StringValue

	@documentation("User that created it")
	createdBy: StringValue

	@documentation("User that updated it")
	updatedBy: StringValue

	authUrl: StringValue
}

list ExternalAPIList {
	member: ExternalAPI
}
