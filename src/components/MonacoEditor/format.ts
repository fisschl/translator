import { css, html, json, languages } from "monaco-editor";
import type { IDisposable } from "monaco-editor";
import type { Plugin } from "prettier";
import prettier from "prettier/standalone";

const formatterDisposables = new Map<string, IDisposable>();

const defaultImport = <T>(module: Promise<{ default: T }>) =>
  module.then((module) => module.default);

const pluginBabel = defaultImport(import("prettier/plugins/babel"));
const pluginEstree = defaultImport(import("prettier/plugins/estree"));
const pluginTypescript = defaultImport(import("prettier/plugins/typescript"));
const pluginPostcss = defaultImport(import("prettier/plugins/postcss"));
const pluginHtml = defaultImport(import("prettier/plugins/html"));

const pluginsByParser: Record<string, Promise<Plugin>[]> = {
  json: [pluginBabel, pluginEstree],
  babel: [pluginBabel, pluginEstree],
  typescript: [pluginTypescript, pluginEstree],
  css: [pluginPostcss],
  html: [
    pluginHtml,
    pluginPostcss,
    pluginBabel,
    pluginEstree,
    pluginTypescript,
  ],
};

const toPrettierParser: Record<string, string> = {
  json: "json",
  javascript: "babel",
  typescript: "typescript",
  css: "css",
  html: "html",
};

export const registerPrettierFormatters = () => {
  json.jsonDefaults.setModeConfiguration({
    ...json.jsonDefaults.modeConfiguration,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
  });

  css.cssDefaults.setModeConfiguration({
    ...css.cssDefaults.modeConfiguration,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
  });

  html.htmlDefaults.setModeConfiguration({
    ...html.htmlDefaults.modeConfiguration,
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
  });

  for (const languageId of Object.keys(toPrettierParser)) {
    formatterDisposables.get(languageId)?.dispose();

    const formatWithPrettier = async (code: string) => {
      const parser = toPrettierParser[languageId];
      if (!parser) return code;

      const pluginPromises = pluginsByParser[parser];
      if (!pluginPromises) return code;

      try {
        return await prettier.format(code, {
          parser,
          plugins: await Promise.all(pluginPromises),
        });
      } catch {
        return code;
      }
    };

    const disposable = languages.registerDocumentFormattingEditProvider(
      { language: languageId, exclusive: true },
      {
        async provideDocumentFormattingEdits(model) {
          const original = model.getValue();
          const formatted = await formatWithPrettier(original);
          if (formatted === original) return [];

          return [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ];
        },
      },
    );

    formatterDisposables.set(languageId, disposable);
  }
};
