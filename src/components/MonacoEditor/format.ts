import type { Plugin } from "prettier";
import prettier from "prettier/standalone";

const languageParser: Record<string, string> = {
  json: "json",
  javascript: "babel",
  typescript: "typescript",
  css: "css",
  html: "html",
};

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

export async function format(code: string, language: string) {
  const parser = languageParser[language];
  const pluginPromises = pluginsByParser[parser];
  if (!parser || !pluginPromises) return code;
  return await prettier.format(code, {
    parser,
    plugins: await Promise.all(pluginPromises),
  });
}
