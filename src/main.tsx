import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/app/router";
import { appTheme } from "@/app/theme";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={appTheme} locale={zhCN}>
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
