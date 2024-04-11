/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package aws.proto.routeoptimizationaccelerator.aws;

import lombok.Getter;
import lombok.Setter;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@Getter
@Setter
public class ECSMetadataRequester {
    private String ecsStatsMetadata;

    private String ecsTaskMetadata;

    private String ecsContainerMetadata;

    private static final Logger logger = LogManager.getLogger(ECSMetadataRequester.class);


    public static String buildMessage(String problemId) {
        ECSMetadataRequester t = new ECSMetadataRequester();

        return "{" +
                "\"problemId\": \"" + problemId + "\"," +
                "\"metadata\": {" +
                    "\"ecsStatsMetadata\": " + t.getEcsStatsMetadata() + "," +
                    "\"ecsTaskMetadata\": " + t.getEcsTaskMetadata() + "," +
                    "\"ecsContainerMetadata\": " + t.getEcsContainerMetadata() +
                "}" +
            "}";
    }

    public ECSMetadataRequester() {
        String containerMetadataUrl = System.getenv().get("ECS_CONTAINER_METADATA_URI_V4");

        this.setEcsContainerMetadata(this.getHttpBody(containerMetadataUrl));
        this.setEcsTaskMetadata(this.getHttpBody(containerMetadataUrl.concat("/task")));
        this.setEcsStatsMetadata(this.getHttpBody(containerMetadataUrl.concat("/stats")));
    }

    public String getHttpBody(String httpLink) {
        try {
            StringBuilder result = new StringBuilder();
            URL url = new URL(httpLink);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                for (String line; (line = reader.readLine()) != null; ) {
                    result.append(line);
                }
            }

            return result.toString();
        } catch (Exception ex) {
            logger.error("Error calling the URL {}: {}", httpLink, ex);
        }

        return null;
    }
}
