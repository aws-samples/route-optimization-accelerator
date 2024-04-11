/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { CodeEditor } from "@cloudscape-design/components";
import React, { useEffect, useState } from "react";

const i18nStrings = {
  loadingState: "Loading code editor",
  errorState: "There was an error loading the code editor.",
  errorStateRecovery: "Retry",

  editorGroupAriaLabel: "Code editor",
  statusBarGroupAriaLabel: "Status bar",

  cursorPosition: (row: number, column: number) => `Ln ${row}, Col ${column}`,
  errorsTab: "Errors",
  warningsTab: "Warnings",
  preferencesButtonAriaLabel: "Preferences",

  paneCloseButtonAriaLabel: "Close",

  preferencesModalHeader: "Preferences",
  preferencesModalCancel: "Cancel",
  preferencesModalConfirm: "Confirm",
  preferencesModalWrapLines: "Wrap lines",
  preferencesModalTheme: "Theme",
  preferencesModalLightThemes: "Light themes",
  preferencesModalDarkThemes: "Dark themes",
};

export interface CodeEditorWrapperProps {
  code?: string;
  onCodeChange?: (code: string) => void;
}

const CodeEditorWrapper: React.FC<CodeEditorWrapperProps> = ({
  code,
  onCodeChange,
}) => {
  const [codeContent, setCodeContent] = useState<string>("");
  const [preferences, setPreferences] = useState<any>(undefined);
  const [ace, setAce] = useState<any>();
  const [editorLoading, setEditorLoading] = useState(true);

  useEffect(() => {
    if (editorLoading) return;

    setCodeContent(code || "");
  }, [editorLoading, code]);

  useEffect(() => {
    const loadAce = async () => {
      // @ts-ignore
      const ace = await import("ace-builds");
      await import("ace-builds/webpack-resolver");
      ace.config.set("useStrictCSP", true);

      return ace;
    };

    loadAce()
      .then((a) => setAce(a))
      .finally(() => setEditorLoading(false));
  }, []);

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(codeContent);
    }
  }, [onCodeChange, codeContent]);

  return (
    <CodeEditor
      language="json"
      value={codeContent}
      preferences={preferences}
      onPreferencesChange={(e) => setPreferences(e.detail)}
      ace={ace}
      loading={editorLoading}
      i18nStrings={i18nStrings}
      onChange={(e) => setCodeContent(e.detail.value)}
    />
  );
};

export default CodeEditorWrapper;
