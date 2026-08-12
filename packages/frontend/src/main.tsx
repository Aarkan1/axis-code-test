import {
  FluentProvider,
  webLightTheme,
  type Theme,
} from "@fluentui/react-components";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import "./styles.css";

const axisTheme: Theme = {
  ...webLightTheme,
  colorBrandBackground: "#ffcc1b",
  colorBrandBackgroundHover: "#e0b500",
  colorBrandBackgroundPressed: "#bd9700",
  colorNeutralForegroundOnBrand: "#2f2f2f",
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find the root element.");
}

createRoot(rootElement).render(
  <StrictMode>
    <FluentProvider theme={axisTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FluentProvider>
  </StrictMode>,
);
