/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import {
  Button,
  Grid,
  Input,
  SpaceBetween,
  TokenGroup,
  TokenGroupProps,
} from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";

export interface TokenEditorProps extends React.PropsWithChildren {
  attributes?: string[];
  tokenGroupLimit?: number;
  onChange?: (attributes: string[]) => void;
}

export const TokenEditor: React.FC<TokenEditorProps> = ({
  onChange,
  attributes,
  tokenGroupLimit,
}) => {
  const [newItem, setNewItem] = useState<string>("");
  const [items, setItems] = React.useState<TokenGroupProps.Item[]>([]);

  useEffect(() => {
    setItems(attributes?.map((t) => ({ label: t })) || []);
  }, [attributes]);

  const onItemAdd = () => {
    if (newItem) {
      const newItems = [...items, { label: newItem }];

      setItems(newItems);
      handleChange(newItems);
      setNewItem("");
    }
  };

  const onItemRemove = (itemIndex: number) => {
    const newItems = [
      ...items.slice(0, itemIndex),
      ...items.slice(itemIndex + 1),
    ];
    setItems(newItems);
    handleChange(newItems);
  };

  const handleChange = (newItems: TokenGroupProps.Item[]) => {
    if (onChange) {
      onChange(newItems.map((q) => q.label!));
    }
  };

  return (
    <SpaceBetween size="s" direction="vertical">
      <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
        <Input
          value={newItem}
          onChange={({ detail }) => setNewItem(detail.value)}
          placeholder="New Item"
          onKeyDown={({ detail }) => {
            if (detail.keyCode === 13) {
              onItemAdd();
            }
          }}
        />
        <Button onClick={onItemAdd} iconName="add-plus">
          Add
        </Button>
      </Grid>
      <Grid gridDefinition={[{ colspan: 12 }]}>
        <TokenGroup
          items={items}
          limit={tokenGroupLimit || Infinity}
          onDismiss={({ detail }) => onItemRemove(detail.itemIndex)}
        />
      </Grid>
    </SpaceBetween>
  );
};
