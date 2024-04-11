/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.aws;

import aws.proto.routeoptimizationaccelerator.data.mapper.CustomObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.eventbridge.EventBridgeClient;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequest;
import software.amazon.awssdk.services.eventbridge.model.PutEventsRequestEntry;
import software.amazon.awssdk.services.eventbridge.model.PutEventsResponse;

import java.time.Instant;

public class EventBridgeHelper {
    private static final Logger logger = LogManager.getLogger(EventBridgeHelper.class);

    private final EventBridgeClient ebClient;
    private final String busName;

    private final String serviceName;
    private final CustomObjectMapper json = new CustomObjectMapper();


    public EventBridgeHelper(String region, String busName, String serviceName) {
        this.busName = busName;
        this.serviceName = serviceName;
        this.ebClient = EventBridgeClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public void sendMessage(Object obj, String type) throws JsonProcessingException {
        boolean success = sendMessage(this.json.writeValueAsString(obj), type);

        if (!success) {
            throw new InternalError("Unable to send the message to event bridge");
        }
    }

    public boolean sendMessage(String message, String type) {
        PutEventsRequestEntry request = PutEventsRequestEntry.builder()
                .detail(message)
                .detailType(type)
                .source(this.serviceName)
                .eventBusName(this.busName)
                .time(Instant.now())
                .build();
        PutEventsRequest events = PutEventsRequest.builder()
                .entries(request)
                .build();

        PutEventsResponse response = this.ebClient.putEvents(events);

        if(response.failedEntryCount() > 0) {
            logger.error("Error sending the events to event bridge {}", response.entries());
        }


        return response.failedEntryCount() == 0;
    }
}
