/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { NorthStarThemeProvider } from "@aws-northstar/ui";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Auth from "./components/Auth";
import RuntimeContextProvider from "./context/RuntimeContext";
import App from "./layouts/App";
import { ApiContextProvider } from "./context/ApiProvider";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NorthStarThemeProvider>
      <BrowserRouter>
        <RuntimeContextProvider>
          <Auth>
            <ApiContextProvider>
              <App />
            </ApiContextProvider>
          </Auth>
        </RuntimeContextProvider>
      </BrowserRouter>
    </NorthStarThemeProvider>
  </React.StrictMode>,
);
