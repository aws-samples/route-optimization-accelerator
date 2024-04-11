/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import * as React from "react";
import { Route, Routes as ReactRoutes } from "react-router-dom";
import { NavItems } from "../NavigationItems";

/**
 * Defines the Routes.
 */
const Routes: React.FC = () => {
  return (
    <ReactRoutes>
      {NavItems.flatMap((q) => [q].concat(q.items || []))
        .filter((item) => item.type !== "divider")
        .map((item, idx) => {
          let link = "";

          if (item.type === "link" || item.type === "expandable-link-group") {
            link = item.href;
          }

          if (item.hasChildrenPages) {
            link += "/*";
          }

          return <Route key={idx} path={link} element={item.element} />;
        })}
    </ReactRoutes>
  );
};

export default Routes;
