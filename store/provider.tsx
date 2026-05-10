"use client";

/**
 * ReduxProvider
 *
 * Wraps the React tree with the Redux store Provider.
 *
 * This is a client component ("use client") so that layout.tsx can remain
 * a pure Server Component (preserving metadata exports, no "use client"
 * directive needed on the layout itself).
 *
 * Usage in app/layout.tsx:
 *   import ReduxProvider from "@/store/provider";
 *   ...
 *   <ReduxProvider>{children}</ReduxProvider>
 */

import { Provider } from "react-redux";
import { store } from "./store";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
