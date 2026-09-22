"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/redux/store";
import { setupPersistence } from "@/redux/persistence";
import HydrationGate from "./hydrationGate";

export default function ReduxProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(makeStore);

  useEffect(() => setupPersistence(store), [store]);

  return (
    <Provider store={store}>
      <HydrationGate>{children}</HydrationGate>
    </Provider>
  );
}
