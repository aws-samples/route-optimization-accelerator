/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator;

import aws.proto.routeoptimizationaccelerator.aws.ECSMetadataRequester;
import aws.proto.routeoptimizationaccelerator.aws.EventBridgeHelper;
import aws.proto.routeoptimizationaccelerator.data.OptimizationRequestValidator;
import aws.proto.routeoptimizationaccelerator.data.input.OptimizationRequest;
import aws.proto.routeoptimizationaccelerator.data.mapper.CustomObjectMapper;
import aws.proto.routeoptimizationaccelerator.data.output.OptimizationResult;
import aws.proto.routeoptimizationaccelerator.exception.InputValidationException;
import aws.proto.routeoptimizationaccelerator.solver.SolverRunner;
import aws.proto.routeoptimizationaccelerator.aws.SqsHelper;
import aws.proto.routeoptimizationaccelerator.utils.Constants;
import aws.proto.routeoptimizationaccelerator.utils.EnvVariables;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.awssdk.services.sqs.model.Message;

public class OptimizationEngine {
  private static final Logger logger = LogManager.getLogger(OptimizationEngine.class);

  public static void main(final String[] args) {
    logger.info("Route Optimization engine started");
    EventBridgeHelper eventBridgeHelper = new EventBridgeHelper(EnvVariables.getRegion(), EnvVariables.eventBusName(), EnvVariables.serviceName());

    try {
      SqsHelper sqsHelper = new SqsHelper(EnvVariables.optimizationQueue(), EnvVariables.getRegion());
      Message queueMessage = getQueueMessage(sqsHelper);
      QueueMessageOrError messageOrError = parseAndValidateMessage(queueMessage);
      String problemId = messageOrError.message != null ? messageOrError.message().getProblemId() :  null;
      eventBridgeHelper.sendMessage(ECSMetadataRequester.buildMessage(problemId), Constants.OPTIMIZATION_METADATA_UPDATE);

      if (messageOrError.error != null) {
        eventBridgeHelper.sendMessage(OptimizationResult.ofError(problemId, messageOrError.error()), Constants.OPTIMIZATION_ERROR);

        System.exit(1);
      }

      OptimizationRequest message = messageOrError.message;

      try {
        eventBridgeHelper.sendMessage(OptimizationResult.ofInProgress(message.getProblemId()), Constants.OPTIMIZATION_IN_PROGRESS);

        SolverRunner.SolutionAndParsedResult solution = new SolverRunner().processMessage(message);

        sqsHelper.deleteMessage(queueMessage);
        eventBridgeHelper.sendMessage(solution.result(), Constants.OPTIMIZATION_COMPLETED);
      } catch (Exception ex) {
        logger.error("Error running the solver.", ex);

        eventBridgeHelper.sendMessage(OptimizationResult.ofError(message.getProblemId(), ex), Constants.OPTIMIZATION_ERROR);

        System.exit(1);
      }

      eventBridgeHelper.sendMessage(ECSMetadataRequester.buildMessage(message.getProblemId()), Constants.OPTIMIZATION_METADATA_UPDATE);

      System.exit(0);
    } catch (Exception ex) {
      logger.error("Unexpected error.", ex);

      try {
        // unexpected error not handled before
        eventBridgeHelper.sendMessage(OptimizationResult.ofError(null, ex), Constants.OPTIMIZATION_ERROR);
      } catch (JsonProcessingException e) {
        logger.error("Unexpected error trying to send result on event bridge.", ex);
      }
    }

    System.exit(1);
  }

  private record QueueMessageOrError(OptimizationRequest message, Exception error) {
    static QueueMessageOrError ofError(String problemId, Exception error) {
      // surface the problemId in order to allow external processes to relate to that specific request
      // if the error is unhandled or unexpected (e.g. json format error) this value will be null
      // and the process won't be able to related to it
      return new QueueMessageOrError(OptimizationRequest.builder().problemId(problemId).build(), error);
    }

    static QueueMessageOrError ofMessage(OptimizationRequest message) {
      return new QueueMessageOrError(message, null);
    }
  }

  private static Message getQueueMessage(SqsHelper sqsHelper) {
    Message dispatchMessage = sqsHelper.getOneMessage();

    if (dispatchMessage == null) {
      logger.warn("No message received, exiting");

      System.exit(0);
    }

    logger.info("Message received: {}", dispatchMessage);

    return dispatchMessage;
  }

  private static QueueMessageOrError parseAndValidateMessage(Message dispatchMessage) {
    OptimizationRequest request;
    String message = dispatchMessage.body();

    try {
      logger.debug("Parsing object: {}", message);

      request = new CustomObjectMapper().readValue(message, OptimizationRequest.class);
    }
    catch (JsonProcessingException e) {
      logger.error("Failed to read the message in the queue.", e);

      return QueueMessageOrError.ofError(tryExtractProblemId(message), e);
    }

    try {
      new OptimizationRequestValidator(request).isValid();

      logger.debug("The message has been parsed correctly: {}", request);

      return QueueMessageOrError.ofMessage(request);
    }catch (InputValidationException e) {
      logger.error("The message didn't pass the validation.", e);

      return QueueMessageOrError.ofError(request.getProblemId(), e);
    }
  }

  public static String tryExtractProblemId(String payload) {
    String token = "\"problemId\":";

    if (payload.contains(token)) {
      try {
          String partial = payload.substring(payload.indexOf(token) + token.length());
          String nextString = partial.substring(0, partial.indexOf(','));
          int fistIndex = nextString.indexOf("\"");
          int lastIndex = nextString.lastIndexOf("\"");

          return nextString.substring(fistIndex + 1, lastIndex);

      } catch (Exception ex) {
        logger.warn("Unable to extract the problem id from the payload: ", ex);
      }
    }

    return null;
  }
}