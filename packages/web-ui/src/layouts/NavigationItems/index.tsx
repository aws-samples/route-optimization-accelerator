/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { SideNavigationProps } from "@cloudscape-design/components";
import { ReactNode } from "react";
import Home from "../../pages/Home";
import OptimizationApp from "../../pages/Optimization";
import ExternalAPIApp from "../../pages/ExternalAPI";
import ExternalAPISample from "../../pages/ExternalAPI/Usage";
import PlaceApp from "../../pages/Place";
import FleetApp from "../../pages/Fleet";
import OrderApp from "../../pages/Order";

type ItemType = SideNavigationProps.Item & {
  element?: ReactNode;
  hasChildrenPages?: boolean;
  items?: any;
};

export const NavItems: ItemType[] = [
  { text: "Home", type: "link", href: "/", element: <Home /> },
  {
    text: "Order",
    type: "link",
    href: "/order",
    hasChildrenPages: true,
    element: <OrderApp />,
  },
  {
    text: "Fleet",
    type: "link",
    href: "/fleet",
    hasChildrenPages: true,
    element: <FleetApp />,
  },
  {
    text: "Place",
    type: "link",
    href: "/place",
    hasChildrenPages: true,
    element: <PlaceApp />,
  },
  {
    text: "Optimization",
    type: "link",
    href: "/optimization",
    hasChildrenPages: true,
    element: <OptimizationApp />,
  },
  { type: "divider" },
  {
    text: "External APIs",
    type: "expandable-link-group",
    href: "/external-api",
    element: <ExternalAPIApp />,
    hasChildrenPages: true,
    items: [
      {
        type: "link",
        text: "Usage",
        href: "/external-api/usage",
        element: <ExternalAPISample />,
        hasChildrenPage: true,
      } as ItemType,
    ],
  },
];
