import type { AssistantId, CapabilityItem } from "../core/inventory/model.js";

/**
 * v0.1 adapter contract: read-only (docs/02 §3 — plan/apply/renderRules land in v0.4).
 */
export interface AssistantAdapter {
  readonly id: AssistantId;
  /** Is this assistant installed on the machine? Must not mutate anything. */
  detect(): Promise<boolean>;
  /** Read-only parse of the assistant's configuration into normalized items. */
  inventory(): Promise<CapabilityItem[]>;
}
