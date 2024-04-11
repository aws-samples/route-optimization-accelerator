/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.aws;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.*;

import java.util.List;

public class SqsHelper {
    private static final Logger logger = LogManager.getLogger(SqsHelper.class);
    private final SqsClient sqsClient;
    private final String queueUrl;

    public SqsHelper(String queueUrl, String region) {
        this.sqsClient = SqsClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        this.queueUrl = queueUrl;
    }

    public String getOneMessageBody() {
        Message message = getOneMessage();
        return message != null ? message.body() : null;
    }

    public Message getOneMessage() {
        return this.getOneMessage(20);
    }

    public Message getOneMessage(int waitTime) {
        List<Message> messages = this.getMessages(1, waitTime);

        return messages.size() > 0 ? messages.get(0) : null;
    }

    public List<Message> getMessages(int numberOfMessages) {
        return getMessages(numberOfMessages, 20);
    }

    public List<Message> getMessages(int numberOfMessages, int waitTime) {
        logger.debug("getting messages {} waiting {} on queue {}", numberOfMessages, waitTime, queueUrl);

        ReceiveMessageRequest receiveMessageRequest = ReceiveMessageRequest.builder()
                .queueUrl(queueUrl)
                .maxNumberOfMessages(numberOfMessages)
                .waitTimeSeconds(waitTime)
                .build();

        ReceiveMessageResponse response = this.sqsClient.receiveMessage(receiveMessageRequest);

        return response.messages();
    }


    public void deleteMessage(Message message) {
        this.deleteMessage(message.receiptHandle());
    }

    public void deleteMessage(String receiptHandle) {
        logger.debug("Deleting message on queue {} with receipt handle {}", queueUrl, receiptHandle);
        DeleteMessageRequest deleteMessageRequest = DeleteMessageRequest.builder()
                .queueUrl(queueUrl)
                .receiptHandle(receiptHandle)
                .build();

        this.sqsClient.deleteMessage(deleteMessageRequest);
    }
}
