/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.solver;

import ai.timefold.solver.core.api.score.ScoreExplanation;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoftlong.HardMediumSoftLongScore;
import ai.timefold.solver.core.api.score.stream.ConstraintStreamImplType;
import ai.timefold.solver.core.api.solver.SolutionManager;
import ai.timefold.solver.core.api.solver.Solver;
import ai.timefold.solver.core.api.solver.SolverFactory;
import ai.timefold.solver.core.config.score.director.ScoreDirectorFactoryConfig;
import ai.timefold.solver.core.config.solver.SolverConfig;
import ai.timefold.solver.core.config.solver.termination.TerminationConfig;
import aws.proto.routeoptimizationaccelerator.data.input.Configuration;
import aws.proto.routeoptimizationaccelerator.data.input.OptimizationRequest;
import aws.proto.routeoptimizationaccelerator.data.output.OptimizationResult;
import aws.proto.routeoptimizationaccelerator.solver.constraints.VehicleRoutingConstraintProvider;
import aws.proto.routeoptimizationaccelerator.solver.domain.Customer;
import aws.proto.routeoptimizationaccelerator.solver.domain.Vehicle;
import aws.proto.routeoptimizationaccelerator.solver.mapper.DefaultConfigurationValuesProvider;
import aws.proto.routeoptimizationaccelerator.solver.mapper.InputMapper;
import aws.proto.routeoptimizationaccelerator.solver.mapper.OutputMapper;
import aws.proto.routeoptimizationaccelerator.solver.solution.VehicleRoutingSolution;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.time.Duration;
import java.time.Instant;

public class SolverRunner {
    private static final Logger logger = LogManager.getLogger(SolverRunner.class);

    public SolverRunner() {}

    public record SolutionAndParsedResult(VehicleRoutingSolution solution, OptimizationResult result) {}

    public SolutionAndParsedResult processMessage(OptimizationRequest message) throws Exception {
        logger.info("Processing {}", message);

        try {
            TerminationConfig terminationConfig = new TerminationConfig();
            terminationConfig.withSpentLimit(Duration.ofSeconds(this.getMaxDuration(message.getConfig())));
            terminationConfig.withUnimprovedSpentLimit(Duration.ofSeconds(this.getUnimprovedMaxDuration(message.getConfig())));

            /*ConstructionHeuristicPhaseConfig heuristicConfig = new ConstructionHeuristicPhaseConfig()
                    .withEntitySorterManner(EntitySorterManner.DECREASING_DIFFICULTY_IF_AVAILABLE)
                    .withForagerConfig(new ConstructionHeuristicForagerConfig()
                            .withPickEarlyType(ConstructionHeuristicPickEarlyType.FIRST_FEASIBLE_SCORE_OR_NON_DETERIORATING_HARD)
                    );


            LocalSearchPhaseConfig localSearchPhaseConfig = new LocalSearchPhaseConfig()
                    .withAcceptorConfig(new LocalSearchAcceptorConfig()
                            .withLateAcceptanceSize(400)
                    )
                    .withMoveSelectorConfig(new UnionMoveSelectorConfig()
                            .withMoveSelectors(
                                    new ListChangeMoveSelectorConfig()
                                            .withValueSelectorConfig(new ValueSelectorConfig().withId("1"))
                                    ,
                                    new ListSwapMoveSelectorConfig()
                                            .withValueSelectorConfig(new ValueSelectorConfig().withId("2"))
                                    ,
                                    new SubListChangeMoveSelectorConfig()
                                            .withSelectReversingMoveToo(true)
                                            .withSubListSelectorConfig(new SubListSelectorConfig().withId("3"))
                                    ,
                                    new SubListSwapMoveSelectorConfig()
                                            .withSelectReversingMoveToo(true)
                                            .withSubListSelectorConfig(new SubListSelectorConfig().withId("4"))
                                    ,
                                    new KOptListMoveSelectorConfig()
                                            .withOriginSelectorConfig(new ValueSelectorConfig().withId("5"))
                            )
                    )
                    .withForagerConfig(new LocalSearchForagerConfig()
                            .withAcceptedCountLimit(4)
                    );*/

            SolverConfig config = new SolverConfig()
                    .withSolutionClass(VehicleRoutingSolution.class)
                    .withEntityClasses(Vehicle.class, Customer.class)
                    //.withPhases(heuristicConfig, localSearchPhaseConfig)
                    .withConstraintStreamImplType(ConstraintStreamImplType.BAVET)
                    .withScoreDirectorFactory(new ScoreDirectorFactoryConfig()
                            .withConstraintProviderClass(VehicleRoutingConstraintProvider.class)
                            .withInitializingScoreTrend("ANY")
                    ).withTerminationConfig(terminationConfig);

            Instant start = Instant.now();

            SolverFactory<VehicleRoutingSolution> solverFactory = SolverFactory.create(config);
            logger.info("Running solver");
            Solver<VehicleRoutingSolution> solver = solverFactory.buildSolver();
            VehicleRoutingSolution solution = solver.solve(InputMapper.convertInputToSolution(message));

            logger.info("Solution generated correctly, writing in the database the best solution");
            logger.info("Score: {}", solution.getScore());

            if (message.getConfig() != null && ObjectUtils.defaultIfNull(message.getConfig().getExplain(), DefaultConfigurationValuesProvider.EXPLAIN)) {
                SolutionManager<VehicleRoutingSolution, HardMediumSoftLongScore> solutionManager = SolutionManager.create(solverFactory);
                ScoreExplanation<VehicleRoutingSolution, HardMediumSoftLongScore> explanation = solutionManager.explain(solution);

                // TODO: write result on the output (at least getConstraintMatchTotalMap())
                logger.info("Explained: {}", explanation);
            }
            Instant end = Instant.now();

            return new SolutionAndParsedResult(solution, OutputMapper.convertSolutionToResult(solution, Duration.between(start, end)));
        } catch (Exception ex) {
            logger.error("Error processing the message", ex);

            throw new Exception(ex);
        }
    }

    private int getMaxDuration(Configuration configuration) {
        int defaultValue = DefaultConfigurationValuesProvider.MAX_SOLVER_DURATION;

        if (configuration == null) {
            return defaultValue;
        }

        return ObjectUtils.defaultIfNull(configuration.getMaxSolverDuration(), defaultValue);
    }

    private int getUnimprovedMaxDuration(Configuration configuration) {
        int defaultValue = DefaultConfigurationValuesProvider.MAX_SOLVER_UNIMPROVED_DURATION;

        if (configuration == null) {
            return defaultValue;
        }

        return ObjectUtils.defaultIfNull(configuration.getMaxUnimprovedSolverDuration(), defaultValue);
    }
}
