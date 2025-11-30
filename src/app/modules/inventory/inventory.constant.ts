export enum InventoryReason {
  ORDER_PLACED = 'ORDER_PLACED',             // customer bought
  ORDER_CANCELLED = 'ORDER_CANCELLED',       // order cancelled, stock back
  ORDER_RETURNED = 'ORDER_RETURNED',         // customer returns items
  ORDER_REFUNDED = 'ORDER_REFUNDED',         // refunded & restocked
  SUPPLIER_INBOUND = 'SUPPLIER_INBOUND',     // new stock from supplier
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',     // manual change by admin
  STOCKTAKE = 'STOCKTAKE',                   // warehouse stock count
  DAMAGED = 'DAMAGED',                       // broken/expired
  LOST = 'LOST',                             // lost/stolen
}