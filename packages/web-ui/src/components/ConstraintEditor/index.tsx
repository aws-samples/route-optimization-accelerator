/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Grid,
  Input,
  Select,
  SelectProps,
} from "@cloudscape-design/components";
import {
  ConstraintData,
  ConstraintType,
} from "@route-optimization-accelerator/web-api-service-typescript-react-query-hooks";
import { useEffect, useState } from "react";

export interface ConstraintEditorProps {
  constraint?: ConstraintData;
  defaultConstraint: ConstraintData;
  allowConstraintTypeEditing?: boolean;
  onChange: (constraint?: ConstraintData) => void;
}

const ConstraintEditor: React.FC<ConstraintEditorProps> = ({
  constraint,
  defaultConstraint,
  allowConstraintTypeEditing,
  onChange,
}) => {
  const [selectedOption, setSelectedOption] =
    useState<SelectProps.Option | null>(null);
  const [data, setData] = useState<ConstraintData>();

  useEffect(() => {
    setData(constraint || defaultConstraint);
  }, [constraint, defaultConstraint]);

  useEffect(() => {
    if (onChange && data) {
      onChange(data);
    }
  }, [onChange, data]);

  useEffect(() => {
    if (selectedOption) {
      setData((old) => ({
        ...old,
        type: selectedOption!.value! as ConstraintType,
      }));
    }
  }, [selectedOption]);

  return (
    <Grid
      gridDefinition={
        allowConstraintTypeEditing
          ? [{ colspan: 6 }, { colspan: 6 }]
          : [{ colspan: 12 }]
      }
    >
      <Input
        type="number"
        value={data?.weight?.toString() || ""}
        onChange={({ detail }) =>
          setData((old) => ({
            ...old,
            weight: Number(detail.value),
          }))
        }
      />
      {allowConstraintTypeEditing && (
        <Select
          selectedOption={selectedOption}
          options={[
            { label: "Hard", value: "Hard" },
            { label: "Medium", value: "Medium" },
            { label: "Soft", value: "Soft" },
          ]}
          onChange={({ detail }) => setSelectedOption(detail.selectedOption)}
        />
      )}
    </Grid>
  );
};

export default ConstraintEditor;
