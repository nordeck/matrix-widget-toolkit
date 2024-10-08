## API Report File for "@matrix-widget-toolkit/react"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Capability } from 'matrix-widget-api';
import { ComponentType } from 'react';
import { DispatchWithoutAction } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { PropsWithChildren } from 'react';
import { Provider } from 'react';
import { ReactElement } from 'react';
import { WidgetApi } from '@matrix-widget-toolkit/api';
import { WidgetEventCapability } from 'matrix-widget-api';
import { WidgetRegistration } from '@matrix-widget-toolkit/api';

// @public
export function CapabilitiesGuard({ capabilities, children, missingCapabilitiesComponent: MissingCapabilitiesComponent, loadingComponent: LoadingComponent, }: CapabilitiesGuardProps): ReactElement;

// @public
export type CapabilitiesGuardProps = PropsWithChildren<{
    capabilities: Array<WidgetEventCapability | Capability>;
    missingCapabilitiesComponent: ComponentType<{
        onRetry: DispatchWithoutAction;
    }>;
    loadingComponent: ComponentType;
}>;

// @public
export type Theme = 'light' | 'dark' | string;

// @public
export type ThemeSelectionContextType = {
    theme: Theme;
    isModal: boolean;
    setTheme: (theme: Theme) => void;
};

// @public
export function ThemeSelectionProvider({ children, }: ThemeSelectionProviderProps): ReactElement;

// @public
export type ThemeSelectionProviderProps = PropsWithChildren;

// @public
export const useThemeSelection: () => ThemeSelectionContextType;

// @public
export const useWidgetApi: () => WidgetApi;

// @public
export const WidgetApiMockProvider: Provider<WidgetApi | undefined>;

// @public
export function WidgetApiProvider({ children, widgetApiPromise, widgetRegistration, loadingViewComponent: LoadingViewComponent, mobileClientErrorComponent: MobileClientErrorComponent, outsideClientErrorComponent: OutsideClientErrorComponent, childErrorComponent: ChildErrorComponent, missingCapabilitiesComponent: MissingCapabilitiesComponent, missingParametersErrorComponent: MissingParametersErrorComponent, }: WidgetApiProviderProps): ReactElement;

// @public
export type WidgetApiProviderProps = PropsWithChildren<{
    widgetRegistration?: WidgetRegistration;
    widgetApiPromise: Promise<WidgetApi>;
    loadingViewComponent: ComponentType;
    mobileClientErrorComponent: ComponentType;
    outsideClientErrorComponent: ComponentType;
    childErrorComponent: ComponentType<FallbackProps>;
    missingCapabilitiesComponent: ComponentType<{
        onRetry: DispatchWithoutAction;
    }>;
    missingParametersErrorComponent: ComponentType<{
        widgetRegistration?: WidgetRegistration;
    }>;
}>;

```
