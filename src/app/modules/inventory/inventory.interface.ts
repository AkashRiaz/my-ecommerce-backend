import { InventoryReason } from "./inventory.constant";

export type IAdjustInventoryPayload = {
  delta: number;               
  reason: InventoryReason;
  actorId?: number | null;    
}