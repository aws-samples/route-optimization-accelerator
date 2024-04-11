/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { Badge, Box, SpaceBetween } from "@cloudscape-design/components";
import React from "react";

export interface TagsProps extends React.PropsWithChildren {
  tags?: string[];
}

export const Tags: React.FC<TagsProps> = ({ tags }) =>
  tags ? (
    <Box>
      <SpaceBetween direction="horizontal" size="xs">
        {tags?.map((t, idx) => (
          <Badge key={`k-${idx}`} color="grey">
            {t}
          </Badge>
        ))}
      </SpaceBetween>
    </Box>
  ) : (
    "-"
  );
