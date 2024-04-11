/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { useCognitoAuthContext } from "@aws-northstar/ui";
import getBreadcrumbs from "@aws-northstar/ui/components/AppLayout/utils/getBreadcrumbs";
import NavHeader from "@aws-northstar/ui/components/AppLayout/components/NavHeader";
import * as React from "react";
import { createContext, useCallback, useEffect, useState } from "react";
import { NavItems } from "../NavigationItems";
import Config from "../../config.json";
import Routes from "../Routes";
import {
  BreadcrumbGroup,
  BreadcrumbGroupProps,
  SideNavigation,
  SideNavigationProps,
} from "@cloudscape-design/components";
import AppLayout, {
  AppLayoutProps,
} from "@cloudscape-design/components/app-layout";
import { useLocation, useNavigate } from "react-router-dom";
import { Optional } from "../../utils/common";

/**
 * Context for updating/retrieving the AppLayout.
 */
export const AppLayoutContext = createContext({
  appLayoutProps: {},
  setAppLayoutProps: (_: AppLayoutProps) => {},
});

/**
 * Defines the App layout and contains logic for routing.
 */
const App: React.FC = () => {
  const [username, setUsername] = useState<Optional<string>>();
  const [email, setEmail] = useState<Optional<string>>();
  const { getAuthenticatedUser } = useCognitoAuthContext();

  const navigate = useNavigate();
  const [activeHref, setActiveHref] = useState("/");
  const [activeBreadcrumbs, setActiveBreadcrumbs] = useState<
    BreadcrumbGroupProps.Item[]
  >([{ text: "/", href: "/" }]);
  const [appLayoutProps, setAppLayoutProps] = useState<AppLayoutProps>({});
  const location = useLocation();

  useEffect(() => {
    const authUser = getAuthenticatedUser();
    setUsername(authUser?.getUsername());

    authUser?.getSession(() => {
      authUser.getUserAttributes((_, attributes) => {
        setEmail(attributes?.find((a) => a.Name === "email")?.Value);
      });
    });
  }, [getAuthenticatedUser, setUsername, setEmail]);

  const setAppLayoutPropsSafe = useCallback(
    (props: AppLayoutProps) => {
      JSON.stringify(appLayoutProps) !== JSON.stringify(props) &&
        setAppLayoutProps(props);
    },
    [appLayoutProps],
  );

  useEffect(() => {
    // keep the focus on the main page even when the user is in a child page
    const activeItem = NavItems.flatMap((q) => [q].concat(q.items || []))
      .filter((item) => item.type !== "divider")
      .filter((q: any) =>
        location.pathname.startsWith(q.href),
      ) as SideNavigationProps.Link[];

    setActiveHref((activeItem.pop() || { href: "/" }).href);
  }, [location.pathname]);

  useEffect(() => {
    const breadcrumbs = getBreadcrumbs(location.pathname, location.search, "/");

    setActiveBreadcrumbs(breadcrumbs);
  }, [location]);

  const onNavigate = useCallback(
    (e: CustomEvent<{ href: string; external?: boolean }>) => {
      if (!e.detail.external) {
        e.preventDefault();
        setAppLayoutPropsSafe({
          contentType: undefined,
          splitPanelOpen: false,
          splitPanelSize: undefined,
          splitPanelPreferences: undefined,
        });

        navigate(e.detail.href);
      }
    },
    [navigate, setAppLayoutPropsSafe],
  );

  return (
    <AppLayoutContext.Provider
      value={{ appLayoutProps, setAppLayoutProps: setAppLayoutPropsSafe }}
    >
      <NavHeader
        title={Config.applicationName}
        logo={Config.logo}
        user={
          username
            ? {
                username,
                email,
              }
            : undefined
        }
        onSignout={() =>
          new Promise(() => {
            getAuthenticatedUser()?.signOut();
            window.location.href = "/";
          })
        }
      />
      <AppLayout
        breadcrumbs={
          <BreadcrumbGroup onFollow={onNavigate} items={activeBreadcrumbs} />
        }
        toolsHide
        navigation={
          <SideNavigation
            header={{ text: "Menu", href: "/" }}
            activeHref={activeHref}
            onFollow={onNavigate}
            items={NavItems}
          />
        }
        content={<Routes />}
        {...appLayoutProps}
      />
    </AppLayoutContext.Provider>
  );
};

export default App;
