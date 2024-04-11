/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
export type Optional<T> = T | undefined;

export const capitalizeFirstLetter = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export function paginate<T>(
  array: any[],
  page_size: number,
  page_number: number,
): T {
  return array.slice(
    (page_number - 1) * page_size,
    page_number * page_size,
  ) as T;
}

export const deepEquals = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export function getById<T>(
  array: T[],
  id: string,
  propName?: string,
): T | undefined {
  const propNameToUse = propName || "id";
  return array.find((q: any): boolean => q[propNameToUse] === id);
}

export const isUndefined = (x: any) => x === undefined;

export const getDefaultIfUndefined = (x: any, def: any) =>
  isUndefined(x) ? def : x;

export const DEFAULTS = {
  pageSize: 20,
  tokenDuration: 365,
};

export enum ViewOptionType {
  map = "map",
  table = "table",
}

export const SELECTABLE_VIEWS_OPTIONS = [
  { text: "Table View", id: ViewOptionType.table },
  { text: "Map View", id: ViewOptionType.map },
];

export const keyReducer = (id?: string) => (acc: any, curr: any) => {
  return {
    ...acc,
    [curr[id || "id"]]: curr,
  };
};
