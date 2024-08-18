/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/
import { monorepo } from "@aws/pdk";
import { TypeScriptProject } from "projen/lib/typescript";
import {
  CDK_VERSION,
  COMMON_TS_PROJECT_OPTIONS,
  configureProject,
  ESLINT_HEADER_RULE,
  PACKAGE_MANAGER,
  PDK_VERSION,
} from "../util/config";

/**
 * Contains configuration for the monorepo (root package).
 */
export class MonorepoProject extends monorepo.MonorepoTsProject {
  /**
   * Namespace to use for all the packages
   * @default @route-optimization-accelerator
   */
  public readonly packageNamespace: string;

  constructor() {
    super({
      ...COMMON_TS_PROJECT_OPTIONS,
      eslint: true,
      eslintOptions: {
        dirs: ["packages/**/**"],
      },
      deps: [
        `aws-cdk-lib@${CDK_VERSION}`,
        "constructs",
        "projen",
        "find-up@^5.0.0",
        "eslint-plugin-header",
        `@aws/pdk@${PDK_VERSION}`,
      ],
      devDeps: [
        // peers
        // project utils
        "@commitlint/cli",
        "@commitlint/config-conventional",
        "@types/node@^16.18.25",
        "cz-conventional-changelog",
        "eslint-plugin-header",
        "husky",
        "license-checker",
        "nodemon",
        "oss-attribution-generator",

        // docs
        "typedoc",
        "typedoc-monorepo-link-types",
      ],
      // monorepoUpgradeDepsOptions: {
      //   syncpackConfig: {
      //     ...monorepo.DEFAULT_CONFIG,
      //     workspace: false,
      //   },
      // },
      name: "monorepo",
      tsconfig: {
        compilerOptions: {
          rootDir: ".",
          baseUrl: ".",
        },
        include: ["**/*.ts"],
      },
    });

    this.packageNamespace = "@route-optimization-accelerator";

    this.eslint?.addPlugins("header");
    this.eslint?.addRules(ESLINT_HEADER_RULE);

    this.addTask("eslint-staged", {
      description:
        "Run eslint against the workspace staged files only; excluding ./packages/ files.",
      steps: [
        {
          // exlcude package files as they are run by the packages directly
          exec: "eslint --fix --no-error-on-unmatched-pattern $(git diff --name-only --relative --staged HEAD . | grep -E '.(ts|tsx)$' | grep -v -E '^packages/' | xargs)",
        },
      ],
    });

    this.addTask("prepare", {
      exec: "husky install",
    });

    const gitSecretsScanTask = this.addTask("git-secrets-scan", {
      exec: "git secrets --scan",
    });

    // Commit lint and commitizen settings
    this.addFields({
      config: {
        commitizen: {
          path: "./node_modules/cz-conventional-changelog",
        },
      },
      commitlint: {
        extends: ["@commitlint/config-conventional"],
      },
      volta: {
        node: "16.20.0",
        yarn: "1.22.19",
      },
    });

    // Update .gitignore
    this.gitignore.exclude(
      "/.tools/",
      "/.idea/",
      "/.nx/cache",
      "*.iml",
      ".tmp",
      "LICENSE-THIRD-PARTY",
      ".DS_Store",
      "build",
      ".env",
      ".venv",
      "tsconfig.tsbuildinfo",
      "docs/**/*.brew.lock.json",
      "scripts/.env",
    );
    this.gitignore.include("/.vscode/*.code-snippets");

    // add local `.npmrc` to automatically avoid build hangs if npx is prompting to install a package
    this.npmrc.addConfig("yes", "true");

    // this.package.addEngine("node", ">=18");

    // ------------------------------------------------------------------------
    // cleanup scripts -- requires yarn and *nix environment
    this.package.setScript(
      "clean:node_modules",
      "(\\find . -type d -name node_modules -exec rm -rf {} \\; &> /dev/null) || exit 0;",
    );
    this.package.setScript(
      "clean:dist",
      "(\\find . -type d -name dist -exec rm -rf {} \\; &> /dev/null) || exit 0;",
    );
    this.package.setScript(
      "clean:cdkout",
      "(\\find . -type d -name cdkout -exec rm -rf {} \\; &> /dev/null) || exit 0;",
    );
    this.package.setScript(
      "clean:lib",
      "(\\find . -type d -name lib -exec rm -rf {} \\; &> /dev/null) || exit 0;",
    );
    this.package.setScript(
      "clean:all",
      `${PACKAGE_MANAGER} clean:dist && ${PACKAGE_MANAGER} clean:cdkout && ${PACKAGE_MANAGER} clean:node_modules && ${PACKAGE_MANAGER} clean:lib`,
    );
    // ------------------------------------------------------------------------

    // short command to build all projects
    this.addTask("build:all", {
      exec: "npx nx run-many --target=build --all --parallel 8",
    });

    // deploy the application stack directly to the account without pipeline
    this.addTask("infra:deploy", {
      exec: `npx nx run ${this.packageNamespace}/infra:deploy`,
    });

    // short command to spin up the admin website
    this.addTask("web:dev", {
      exec: `npx nx run ${this.packageNamespace}/admin-website:dev`,
    });

    // ------------------------------------------------------------------------
    // security review generator scripts
    const srBanditTask = this.addTask("security-report:bandit", {
      exec: "bandit --recursive . --format json --number 3 --severity-level high --exclude '**/node_modules/*,**/.nx/cache/*,**/.env/*,**/cdk.out/*,**/dist/*' --output reports/bandit-report.json",
    });

    const srPnpmAuditTask = this.addTask("security-report:pnpm-audit", {
      exec: `(pnpm audit --prod > reports/pnpm-audit-report.txt) || exit 0;`,
    });

    const srCfnNagTask = this.addTask("security-report:cfn-nag", {
      // exec: `(cfn_nag_scan --input-path=packages/infra-app/cdk.out --output-format json --template-pattern='^(?!.*asset\.[\d|\w]+\.json)(?!.*asset\.[\d|\w]+/(asset-manifest|runtime-config|manifest)\.json)(?!.*buildspec-[\d|\w]+-FileAsset\.yaml)(.*\.json|.*\.yaml|.*\.yml|.*\.template)$' > reports/cfn-nag-report.json) || exit 0;`,
      exec: `(cfn_nag_scan --input-path=packages/infra-app/cdk.out --output-format json --template-pattern='^(?:(?!asset\.[\d|\w]+\.json)|(?=.*asset\.[\d|\w]+/(?!asset-manifest|runtime-config|manifest)\w+\.json))(?!.*asset\.[\d|\w]{32}/(?:asset-manifest|manifest|runtime-config)\.json)(?!.*buildspec-[\d|\w]+-FileAsset\.yaml)(.*\.json|.*\.yaml|.*\.yml|.*\.template)$' > reports/cfn-nag-report.json) || exit 0;`,
    });

    const srCdkNagTask = this.addTask("security-report:cdk-nag", {
      exec: "mkdir -p reports/cdknag && rm -rf reports/cdknag/* && \\cp -r packages/infra-app/cdk.out/*-NagReport.csv reports/cdknag/",
    });

    this.addTask("security-report-all", {
      steps: [
        { spawn: srBanditTask.name },
        { spawn: srPnpmAuditTask.name },
        { spawn: srCfnNagTask.name },
        { spawn: srCdkNagTask.name },
      ],
    });
    // ------------------------------------------------------------------------

    // ------------------------------------------------------------------------
    // license checker and oss attribution
    this.addTask("license-check", {
      exec: "npx license-checker --summary --production --onlyAllow 'MIT;Apache-2.0;Unlicense;UNLICENSED;BSD;BSD-2-Clause;BSD-3-Clause;ISC;Python-2.0;CC-BY-3.0;CC0-1.0' > ./reports/license-check.txt",
    });

    this.addTask("oss-attribution", {
      exec: "npx -p oss-attribution-generator@latest generate-attribution && mv oss-attribution/attribution.txt ./reports/LICENSE_THIRD_PARTY && rm -rf oss-attribution",
    });
    // ------------------------------------------------------------------------
    this.testTask.spawn(gitSecretsScanTask);

    configureProject(this);
  }

  /**
   * @inheritDoc
   */
  synth() {
    this.subprojects.forEach((subProject: any) => {
      this.configureEsLint(subProject);
    });

    super.synth();
  }

  configureEsLint(project: TypeScriptProject) {
    if (project.eslint) {
      // override from the main eslint file
      project.tryRemoveFile(".eslintrc.json");
    }
  }
}
