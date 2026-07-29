import { ExecutionContext, Injectable, ToolDecorator as Tool, Widget, z } from '@nitrostack/core';
import { Employee, FranchiseDataService, Product, SaleLineItem, Store } from './franchise.data.js';

const storeSchema = z.object({
  id: z.string().min(3).describe('Unique store ID'),
  name: z.string().min(3).describe('Store display name'),
  city: z.string().describe('City where the store operates'),
  region: z.string().describe('Business region'),
  status: z.enum(['active', 'disabled']).default('active'),
  manager: z.string().describe('Store manager name'),
  openedOn: z.string().describe('Store opening date in YYYY-MM-DD format'),
});

const productSchema = z.object({
  sku: z.string().min(3).describe('Unique SKU'),
  name: z.string().min(2),
  category: z.string(),
  price: z.number().positive(),
  reorderPoint: z.number().int().nonnegative(),
  attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
});

const employeeSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(2),
  role: z.string().min(2),
  storeId: z.string().min(3),
  status: z.enum(['active', 'inactive']).default('active'),
  joinedOn: z.string().describe('Joining date in YYYY-MM-DD format'),
});

const saleItemsSchema = z.array(z.object({
  sku: z.string().min(3),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})).min(1);

@Injectable({ deps: [FranchiseDataService] })
export class FranchiseTools {
  constructor(private readonly data: FranchiseDataService) {}

  @Tool({
    name: 'register_store',
    description: 'Register a franchise store with manager, region, and operational status.',
    inputSchema: storeSchema,
    invocation: { invoking: 'Registering store...', invoked: 'Store registered' },
  })
  async registerStore(input: Store, ctx: ExecutionContext) {
    ctx.logger.info('Registering store', { storeId: input.id });
    return {
      message: `Store ${input.name} registered successfully`,
      store: await this.data.registerStore(input),
    };
  }

  @Tool({
    name: 'add_product',
    description: 'Add a franchise product with flexible attributes and a unique SKU.',
    inputSchema: productSchema,
    invocation: { invoking: 'Adding product...', invoked: 'Product added' },
  })
  async addProduct(input: Product, ctx: ExecutionContext) {
    ctx.logger.info('Adding product', { sku: input.sku });
    return {
      message: `Product ${input.name} added successfully`,
      product: await this.data.addProduct(input),
    };
  }

  @Tool({
    name: 'update_stock',
    description: 'Increase or decrease inventory for a store without allowing negative stock.',
    inputSchema: z.object({
      storeId: z.string(),
      sku: z.string(),
      delta: z.number().int().describe('Positive adds stock, negative removes stock'),
      reason: z.string().optional(),
    }),
    invocation: { invoking: 'Updating stock...', invoked: 'Stock updated' },
  })
  async updateStock(input: { storeId: string; sku: string; delta: number; reason?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Updating stock', input);
    return {
      message: `Inventory adjusted by ${input.delta} units`,
      inventory: await this.data.updateStock(input.storeId, input.sku, input.delta),
      reason: input.reason ?? 'manual adjustment',
    };
  }

  @Tool({
    name: 'transfer_stock',
    description: 'Move stock between stores while enforcing available inventory.',
    inputSchema: z.object({
      fromStoreId: z.string(),
      toStoreId: z.string(),
      sku: z.string(),
      quantity: z.number().int().positive(),
    }),
    invocation: { invoking: 'Creating transfer...', invoked: 'Transfer created' },
  })
  async transferStock(input: { fromStoreId: string; toStoreId: string; sku: string; quantity: number }, ctx: ExecutionContext) {
    ctx.logger.info('Creating stock transfer', input);
    return {
      message: 'Transfer created and source stock reserved immediately',
      transfer: await this.data.createTransfer(input.fromStoreId, input.toStoreId, input.sku, input.quantity),
    };
  }

  @Tool({
    name: 'receive_stock',
    description: 'Mark a pending transfer as received and credit stock to the destination store.',
    inputSchema: z.object({
      transferId: z.string(),
    }),
    invocation: { invoking: 'Receiving transfer...', invoked: 'Transfer received' },
  })
  async receiveStock(input: { transferId: string }, ctx: ExecutionContext) {
    ctx.logger.info('Receiving transfer', input);
    return {
      message: 'Transfer marked as received',
      transfer: await this.data.receiveTransfer(input.transferId),
    };
  }

  @Tool({
    name: 'record_sale',
    description: 'Record a sale, reduce inventory, and associate it with an employee in an active store.',
    inputSchema: z.object({
      storeId: z.string(),
      employeeId: z.string(),
      items: saleItemsSchema,
    }),
    invocation: { invoking: 'Recording sale...', invoked: 'Sale recorded' },
  })
  async recordSale(input: { storeId: string; employeeId: string; items: SaleLineItem[] }, ctx: ExecutionContext) {
    ctx.logger.info('Recording sale', { storeId: input.storeId, employeeId: input.employeeId, items: input.items.length });
    return {
      message: 'Sale recorded and inventory decremented',
      sale: await this.data.recordSale(input.storeId, input.employeeId, input.items),
    };
  }

  @Tool({
    name: 'refund_sale',
    description: 'Refund part of a sale while preventing refunds beyond the sold quantity.',
    inputSchema: z.object({
      saleId: z.string(),
      sku: z.string(),
      quantity: z.number().int().positive(),
    }),
    invocation: { invoking: 'Processing refund...', invoked: 'Refund processed' },
  })
  async refundSale(input: { saleId: string; sku: string; quantity: number }, ctx: ExecutionContext) {
    ctx.logger.info('Refunding sale', input);
    return {
      message: 'Refund processed and stock restored',
      refund: await this.data.refundSale(input.saleId, input.sku, input.quantity),
    };
  }

  @Tool({
    name: 'register_employee',
    description: 'Register a store employee and enforce assignment only to active stores.',
    inputSchema: employeeSchema,
    invocation: { invoking: 'Registering employee...', invoked: 'Employee registered' },
  })
  async registerEmployee(input: Employee, ctx: ExecutionContext) {
    ctx.logger.info('Registering employee', { employeeId: input.id, storeId: input.storeId });
    return {
      message: `Employee ${input.name} registered successfully`,
      employee: await this.data.registerEmployee(input),
    };
  }

  @Tool({
    name: 'store_dashboard',
    description: 'Show the store dashboard with KPIs, recent sales, and low-stock alerts.',
    inputSchema: z.object({
      storeId: z.string().optional(),
    }),
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  @Widget('store-dashboard')
  async storeDashboard(input: { storeId?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Loading store dashboard', input);
    return this.data.getDashboard(input.storeId);
  }

  @Tool({
    name: 'inventory_widget',
    description: 'Open an inventory-focused widget with stock health and category totals.',
    inputSchema: z.object({
      storeId: z.string().optional(),
    }),
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  @Widget('inventory-widget')
  async inventoryWidget(input: { storeId?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Loading inventory widget', input);
    return this.data.getInventoryWidgetData(input.storeId);
  }

  @Tool({
    name: 'sales_dashboard',
    description: 'Open a sales dashboard with revenue breakdowns and recent transactions.',
    inputSchema: z.object({
      storeId: z.string().optional(),
    }),
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  @Widget('sales-dashboard')
  async salesDashboard(input: { storeId?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Loading sales dashboard', input);
    return this.data.getSalesWidgetData(input.storeId);
  }

  @Tool({
    name: 'transfer_timeline',
    description: 'Open a transfer timeline widget showing stock movement between stores.',
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, idempotentHint: true },
  })
  @Widget('transfer-timeline')
  async transferTimeline(_: Record<string, never>, ctx: ExecutionContext) {
    ctx.logger.info('Loading transfer timeline');
    return {
      transfers: await this.data.getTransferWidgetData(),
    };
  }

  @Tool({
    name: 'generate_daily_sales_report',
    description: 'Generate the daily sales report as a NitroStack task or regular tool call.',
    inputSchema: z.object({
      date: z.string().describe('Date in YYYY-MM-DD format'),
    }),
    taskSupport: 'optional',
    invocation: { invoking: 'Building daily sales report...', invoked: 'Daily report ready' },
  })
  async generateDailySalesReport(input: { date: string }, ctx: ExecutionContext) {
    return this.runTask(ctx, [
      'Collecting sales for the selected date',
      'Summarising revenue by store',
      'Preparing top transaction snapshot',
    ], () => this.data.buildDailySalesReport(input.date));
  }

  @Tool({
    name: 'generate_weekly_inventory_report',
    description: 'Generate a weekly inventory report with low-stock warnings.',
    inputSchema: z.object({
      storeId: z.string().optional(),
    }),
    taskSupport: 'optional',
    invocation: { invoking: 'Compiling inventory report...', invoked: 'Inventory report ready' },
  })
  async generateWeeklyInventoryReport(input: { storeId?: string }, ctx: ExecutionContext) {
    return this.runTask(ctx, [
      'Reading inventory across stores',
      'Flagging reorder risks',
      'Grouping stock by category',
    ], () => this.data.buildWeeklyInventoryReport(input.storeId));
  }

  @Tool({
    name: 'bulk_import',
    description: 'Bulk import stores, products, employees, and stock using a single payload.',
    inputSchema: z.object({
      stores: z.array(storeSchema).optional(),
      products: z.array(productSchema).optional(),
      employees: z.array(employeeSchema).optional(),
      inventory: z.array(z.object({
        storeId: z.string(),
        sku: z.string(),
        quantity: z.number().int().nonnegative(),
      })).optional(),
    }),
    taskSupport: 'optional',
    invocation: { invoking: 'Importing franchise data...', invoked: 'Bulk import complete' },
  })
  async bulkImport(input: {
    stores?: Store[];
    products?: Product[];
    employees?: Employee[];
    inventory?: Array<{ storeId: string; sku: string; quantity: number }>;
  }, ctx: ExecutionContext) {
    return this.runTask(ctx, [
      'Validating incoming payload',
      'Applying store and product records',
      'Updating employee and inventory documents',
    ], () => this.data.bulkImport(input));
  }

  @Tool({
    name: 'inventory_sync',
    description: 'Run an inventory sync task to refresh timestamps and expose pending transfer counts.',
    inputSchema: z.object({}),
    taskSupport: 'optional',
    invocation: { invoking: 'Syncing inventory...', invoked: 'Inventory sync complete' },
  })
  async inventorySync(_: Record<string, never>, ctx: ExecutionContext) {
    return this.runTask(ctx, [
      'Refreshing inventory timestamps',
      'Checking pending transfer backlog',
      'Publishing sync result',
    ], () => this.data.syncInventory());
  }

  @Tool({
    name: 'generate_monthly_performance_report',
    description: 'Generate a monthly performance report for store-level revenue and staffing health.',
    inputSchema: z.object({
      month: z.string().describe('Month prefix in YYYY-MM format'),
    }),
    taskSupport: 'optional',
    invocation: { invoking: 'Compiling monthly performance...', invoked: 'Monthly report ready' },
  })
  async generateMonthlyPerformanceReport(input: { month: string }, ctx: ExecutionContext) {
    return this.runTask(ctx, [
      'Collecting monthly sales activity',
      'Calculating revenue by store',
      'Ranking top performers',
    ], () => this.data.buildMonthlyPerformanceReport(input.month));
  }

  private async runTask<T>(ctx: ExecutionContext, steps: string[], work: () => T | Promise<T>) {
    for (const step of steps) {
      ctx.task?.throwIfCancelled();
      ctx.task?.updateProgress(step);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    return work();
  }
}
