/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import inst from "dayjs";
import type { PluginFunc } from "dayjs";

declare module "dayjs" {
  interface Dayjs {
    ceil(unit: any, amount: number): inst.Dayjs;
  }
}

const ceil: PluginFunc = (_, dayjsClass) => {
  dayjsClass.prototype.ceil = function (unit, amount) {
    return this.add(amount - (this.get(unit) % amount), unit).startOf(unit);
  };
};
export default ceil;
