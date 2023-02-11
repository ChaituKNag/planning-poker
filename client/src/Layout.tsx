import React, { useLayoutEffect, useState } from "react";
import { setupApi } from "./api";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const io = setupApi();

    io.once("connected", () => {
      setReady(true);
    });
  }, []);

  if (!ready) return <div>loading...</div>;

  return <div>{children}</div>;
};

export default Layout;
