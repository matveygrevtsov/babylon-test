import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import * as cannon from "cannon-es";
import { Layout } from "./components/Layout/Layout";
import { ROUTES } from "./routes";

window.CANNON = cannon;

export const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {ROUTES.map(({ pathname, element }) => (
            <Route key={pathname} path={pathname} element={element} />
          ))}
        </Routes>
      </Layout>
    </HashRouter>
  );
};
