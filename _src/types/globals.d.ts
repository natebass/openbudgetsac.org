import type React from 'react';

declare global {
  interface LegacyObNamespace {
    [key: string]: any;
    data?: any;
    display?: any;
    palette?: any;
    hash?: any;
  }

  interface PurlApi {
    attr(name?: string): any;
    param(name?: string): any;
    fparam(name?: string): any;
    segment(index?: number): any;
    fsegment(index?: number): any;
    data: any;
  }

  interface DefineFunction {
    (...args: Array<any>): void;
    amd?: unknown;
  }

  interface ObI18nRuntime {
    normalizeLocale?(value: unknown): string | null;
    resolveLocale?(): string;
    setLocale?(locale: string): void;
    t?(key: string, fallback?: string, vars?: Record<string, unknown>): string;
    translateLegacyText?(value: string): string;
  }

  interface Window {
    __axeA11yRuntimeEnabled?: boolean;
    axe?: {
      run(
        root: Element,
        options?: unknown,
      ): Promise<{violations: Array<unknown>}>;
    };
    ob?: LegacyObNamespace;
    obI18n?: ObI18nRuntime;
    purl?: (url?: string | boolean, strictMode?: boolean) => PurlApi;
    treemapWidgetLoaded?: boolean;
    wdg_widget?: unknown;
  }

  interface Navigator {
    deviceMemory?: number;
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }

  interface NetworkInformation extends EventTarget {
    effectiveType?: string;
    saveData?: boolean;
  }

  interface JQueryStatic {
    browser?: {
      msie?: boolean;
    };
    fn: Record<string, any>;
    url(url?: string): {
      attr(name: string): string;
      param(name?: string): any;
    };
  }

  interface JQuery {
    foundation?: (...args: Array<unknown>) => JQuery;
    url?(strictMode?: boolean): PurlApi;
  }

  var $: JQueryStatic;
  var React: typeof React;
  var OpenSpending: any;
  var ob: LegacyObNamespace;
  var _grandparent: any;
  var $jit: any;
  var _: any;
  var d3: any;
  var define: DefineFunction;
  var jQuery: any;
  var json: any;
  var yepnope: any;
  let event: MouseEvent | undefined;
  let width: number;
}
