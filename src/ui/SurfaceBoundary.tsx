import { Component, type ReactNode } from "react";
import { store } from "../game/store";

// The protection bar remains outside this boundary even if a game panel fails.
export class SurfaceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { store.set({ paused: true, protectionOpen: "pause" }); }
  render() {
    if (this.state.failed) return <div className="load-error" role="alert"><h1>Diese Ansicht konnte nicht geöffnet werden</h1><p>Die Reise ist unterbrochen. Über die Leiste oben kannst du Hilfe öffnen oder zum Einstieg zurückkehren. Dein gespeicherter Stand bleibt erhalten.</p></div>;
    return this.props.children;
  }
}
