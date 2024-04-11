/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Box,
  Button,
  Popover,
  StatusIndicator,
} from "@cloudscape-design/components";

export interface CopyComponentProps {
  text: string;
  textToCopy: string;
  name: string;
}

const CopyComponent: React.FC<CopyComponentProps> = ({
  text,
  textToCopy,
  name,
}) => {
  return (
    <span className="custom-wrapping">
      <Box margin={{ right: "xxs" }} display="inline-block">
        <Popover
          size="small"
          position="top"
          triggerType="custom"
          dismissButton={false}
          content={
            <StatusIndicator type="success">{name} Copied</StatusIndicator>
          }
        >
          <Button
            variant="inline-icon"
            iconName="copy"
            ariaLabel={`Copy the ${name}`}
            onClick={() => {
              navigator.clipboard.writeText(textToCopy);
            }}
          />
        </Popover>
      </Box>
      {text}
    </span>
  );
};

export default CopyComponent;
