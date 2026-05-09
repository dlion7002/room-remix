export const roomRemixComponentRegistry = [
  { id: "room.upload", component: "RoomUploadCard" },
  { id: "room.analysis", component: "RoomAnalysisPanel" },
  { id: "room.grid", component: "RoomGridOverlay" },
  { id: "room.confirmation", component: "DetectedObjectsConfirmation" },
  { id: "design.preferences", component: "DesignPreferencesPanel" },
  { id: "design.board", component: "DesignBoard" },
  { id: "design.refinement", component: "ElementRefinementPanel" },
  { id: "preview.panel", component: "PreviewPanel" },
  { id: "preview.fidelity", component: "FidelityReportCard" },
  { id: "state.inspector", component: "RoomStateInspector" },
  { id: "agent.trace", component: "AgentTracePanel" },
] as const;

