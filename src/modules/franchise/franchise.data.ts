import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nitrostack/core';
import mongoose, { InferSchemaType, Model, Schema } from 'mongoose';

export interface Store {
  id: string;
  name: string;
  city: string;
  region: string;
  status: 'active' | 'disabled';
  manager: string;
  openedOn: string;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  attributes: Record<string, string | number | boolean>;
  reorderPoint: number;
}

export interface InventoryRecord {
  storeId: string;
  sku: string;
  quantity: number;
  reserved: number;
  lastUpdated: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  storeId: string;
  status: 'active' | 'inactive';
  joinedOn: string;
}

export interface SaleLineItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  storeId: string;
  employeeId: string;
  soldAt: string;
  items: SaleLineItem[];
  total: number;
  refundedItems: Record<string, number>;
}

export interface Transfer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  sku: string;
  quantity: number;
  status: 'pending' | 'received';
  createdAt: string;
  receivedAt?: string;
}

export interface ImportSummary {
  storesAdded: number;
  employeesAdded: number;
  productsAdded: number;
  stockAdjustments: number;
}

function todayMinus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function seedDatabase() {
  return {
    stores: [
      {
        id: 'store-blr-001',
        name: 'NitroStack Koramangala',
        city: 'Bengaluru',
        region: 'South',
        status: 'active' as const,
        manager: 'Aarav Menon',
        openedOn: '2025-02-14',
      },
      {
        id: 'store-hyd-002',
        name: 'NitroStack Jubilee Hills',
        city: 'Hyderabad',
        region: 'South',
        status: 'active' as const,
        manager: 'Riya Sharma',
        openedOn: '2025-06-08',
      },
      {
        id: 'store-pun-003',
        name: 'NitroStack Baner',
        city: 'Pune',
        region: 'West',
        status: 'disabled' as const,
        manager: 'Karan Deshmukh',
        openedOn: '2024-11-20',
      },
    ],
    products: [
      {
        sku: 'BEV-CF-001',
        name: 'Cold Brew Can',
        category: 'beverages',
        price: 120,
        reorderPoint: 18,
        attributes: { sizeMl: 330, caffeinated: true, shelfLifeDays: 45 },
      },
      {
        sku: 'SNK-PR-010',
        name: 'Protein Bar',
        category: 'snacks',
        price: 95,
        reorderPoint: 24,
        attributes: { flavour: 'chocolate', proteinGrams: 18, vegetarian: true },
      },
      {
        sku: 'MER-CP-220',
        name: 'Ceramic Mug',
        category: 'merchandise',
        price: 260,
        reorderPoint: 10,
        attributes: { color: 'white', dishwasherSafe: true },
      },
    ],
    inventory: [
      { storeId: 'store-blr-001', sku: 'BEV-CF-001', quantity: 60, reserved: 6, lastUpdated: todayMinus(1) },
      { storeId: 'store-blr-001', sku: 'SNK-PR-010', quantity: 42, reserved: 4, lastUpdated: todayMinus(1) },
      { storeId: 'store-blr-001', sku: 'MER-CP-220', quantity: 16, reserved: 1, lastUpdated: todayMinus(2) },
      { storeId: 'store-hyd-002', sku: 'BEV-CF-001', quantity: 24, reserved: 2, lastUpdated: todayMinus(1) },
      { storeId: 'store-hyd-002', sku: 'SNK-PR-010', quantity: 15, reserved: 1, lastUpdated: todayMinus(1) },
      { storeId: 'store-hyd-002', sku: 'MER-CP-220', quantity: 8, reserved: 0, lastUpdated: todayMinus(5) },
      { storeId: 'store-pun-003', sku: 'BEV-CF-001', quantity: 12, reserved: 0, lastUpdated: todayMinus(7) },
    ],
    employees: [
      { id: 'emp-101', name: 'Neha Joshi', role: 'cashier', storeId: 'store-blr-001', status: 'active' as const, joinedOn: '2025-03-11' },
      { id: 'emp-102', name: 'Sameer Khan', role: 'supervisor', storeId: 'store-blr-001', status: 'active' as const, joinedOn: '2025-04-18' },
      { id: 'emp-201', name: 'Ishita Rao', role: 'cashier', storeId: 'store-hyd-002', status: 'active' as const, joinedOn: '2025-07-02' },
    ],
    sales: [
      {
        id: 'sale-9001',
        storeId: 'store-blr-001',
        employeeId: 'emp-101',
        soldAt: todayMinus(0),
        items: [
          { sku: 'BEV-CF-001', quantity: 4, unitPrice: 120 },
          { sku: 'SNK-PR-010', quantity: 2, unitPrice: 95 },
        ],
        total: 670,
        refundedItems: {},
      },
      {
        id: 'sale-9002',
        storeId: 'store-hyd-002',
        employeeId: 'emp-201',
        soldAt: todayMinus(1),
        items: [
          { sku: 'MER-CP-220', quantity: 1, unitPrice: 260 },
          { sku: 'SNK-PR-010', quantity: 3, unitPrice: 95 },
        ],
        total: 545,
        refundedItems: { 'SNK-PR-010': 1 },
      },
    ],
    transfers: [
      {
        id: 'trf-3001',
        fromStoreId: 'store-blr-001',
        toStoreId: 'store-hyd-002',
        sku: 'SNK-PR-010',
        quantity: 8,
        status: 'pending' as const,
        createdAt: todayMinus(2),
      },
      {
        id: 'trf-3002',
        fromStoreId: 'store-blr-001',
        toStoreId: 'store-pun-003',
        sku: 'MER-CP-220',
        quantity: 2,
        status: 'received' as const,
        createdAt: todayMinus(8),
        receivedAt: todayMinus(7),
      },
    ],
  };
}

const storeSchema = new Schema<Store>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  status: { type: String, enum: ['active', 'disabled'], required: true },
  manager: { type: String, required: true },
  openedOn: { type: String, required: true },
}, { versionKey: false });

const productSchema = new Schema<Product>({
  sku: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  reorderPoint: { type: Number, required: true },
  attributes: { type: Schema.Types.Mixed, default: {} },
}, { versionKey: false });

const inventorySchema = new Schema<InventoryRecord>({
  storeId: { type: String, required: true, index: true },
  sku: { type: String, required: true, index: true },
  quantity: { type: Number, required: true, default: 0 },
  reserved: { type: Number, required: true, default: 0 },
  lastUpdated: { type: String, required: true },
}, { versionKey: false });
inventorySchema.index({ storeId: 1, sku: 1 }, { unique: true });

const employeeSchema = new Schema<Employee>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  storeId: { type: String, required: true, index: true },
  status: { type: String, enum: ['active', 'inactive'], required: true },
  joinedOn: { type: String, required: true },
}, { versionKey: false });

const saleItemSchema = new Schema<SaleLineItem>({
  sku: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
}, { _id: false, versionKey: false });

const saleSchema = new Schema<Sale>({
  id: { type: String, required: true, unique: true, index: true },
  storeId: { type: String, required: true, index: true },
  employeeId: { type: String, required: true, index: true },
  soldAt: { type: String, required: true, index: true },
  items: { type: [saleItemSchema], required: true },
  total: { type: Number, required: true },
  refundedItems: { type: Map, of: Number, default: {} },
}, { versionKey: false });

const transferSchema = new Schema<Transfer>({
  id: { type: String, required: true, unique: true, index: true },
  fromStoreId: { type: String, required: true, index: true },
  toStoreId: { type: String, required: true, index: true },
  sku: { type: String, required: true, index: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'received'], required: true, index: true },
  createdAt: { type: String, required: true, index: true },
  receivedAt: { type: String },
}, { versionKey: false });

type InventoryDoc = InferSchemaType<typeof inventorySchema>;

@Injectable()
export class FranchiseDataService implements OnModuleInit, OnApplicationShutdown {
  private readonly mongoUri = process.env.MONGODB_URI;
  private readonly dbName = process.env.MONGODB_DB_NAME || 'franchise_ops';
  private readyPromise?: Promise<void>;
  private lastConnectionError?: string;
  private lastConnectionAttemptAt?: string;
  private hasSeeded = false;

  private readonly StoreModel: Model<Store> = mongoose.models.FranchiseStore || mongoose.model<Store>('FranchiseStore', storeSchema);
  private readonly ProductModel: Model<Product> = mongoose.models.FranchiseProduct || mongoose.model<Product>('FranchiseProduct', productSchema);
  private readonly InventoryModel: Model<InventoryRecord> = mongoose.models.FranchiseInventory || mongoose.model<InventoryRecord>('FranchiseInventory', inventorySchema);
  private readonly EmployeeModel: Model<Employee> = mongoose.models.FranchiseEmployee || mongoose.model<Employee>('FranchiseEmployee', employeeSchema);
  private readonly SaleModel: Model<Sale> = mongoose.models.FranchiseSale || mongoose.model<Sale>('FranchiseSale', saleSchema);
  private readonly TransferModel: Model<Transfer> = mongoose.models.FranchiseTransfer || mongoose.model<Transfer>('FranchiseTransfer', transferSchema);

  async onModuleInit() {
    await this.ensureMongoReady('startup', false);
  }

  async onApplicationShutdown() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  private async ready() {
    await this.ensureMongoReady('runtime request', true);
  }

  private getMongoTarget() {
    if (!this.mongoUri) {
      return 'missing MONGODB_URI';
    }

    try {
      const url = new URL(this.mongoUri);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
      return 'unparseable MongoDB URI';
    }
  }

  getDatabaseStatus() {
    return {
      readyState: mongoose.connection.readyState,
      target: this.getMongoTarget(),
      dbName: this.dbName,
      lastConnectionAttemptAt: this.lastConnectionAttemptAt,
      lastConnectionError: this.lastConnectionError,
    };
  }

  private buildConnectionErrorMessage(error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    return `MongoDB is unavailable for ${this.dbName} at ${this.getMongoTarget()}. ${details}`;
  }

  private async ensureMongoReady(reason: string, throwOnFailure: boolean) {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    if (!this.mongoUri) {
      const message = 'MONGODB_URI is required. Set it in your environment before starting the MCP server.';
      this.lastConnectionError = message;
      console.error(`[MongoDB] ${message}`);
      if (throwOnFailure) {
        throw new Error(message);
      }
      return;
    }

    if (!this.readyPromise) {
      this.lastConnectionAttemptAt = new Date().toISOString();
      console.info(`[MongoDB] Connecting for ${reason}: ${this.getMongoTarget()} (db: ${this.dbName})`);
      this.readyPromise = this.connectAndSeed()
        .then(() => {
          this.lastConnectionError = undefined;
          console.info(`[MongoDB] Connection ready for ${this.dbName}`);
        })
        .catch((error) => {
          this.lastConnectionError = this.buildConnectionErrorMessage(error);
          console.error(`[MongoDB] ${this.lastConnectionError}`);
          throw error;
        })
        .finally(() => {
          if (mongoose.connection.readyState !== 1) {
            this.readyPromise = undefined;
          }
        });
    }

    try {
      await this.readyPromise;
    } catch (error) {
      if (throwOnFailure) {
        throw new Error(this.buildConnectionErrorMessage(error));
      }
    }
  }

  private async connectAndSeed() {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(this.mongoUri!, {
        dbName: this.dbName,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      });
    }

    if (this.hasSeeded) {
      return;
    }

    const storeCount = await this.StoreModel.countDocuments();
    if (storeCount > 0) {
      this.hasSeeded = true;
      return;
    }

    const seed = seedDatabase();
    // Seed only when the database is empty so first run stays convenient without hiding real data later.
    await this.StoreModel.insertMany(seed.stores);
    await this.ProductModel.insertMany(seed.products);
    await this.InventoryModel.insertMany(seed.inventory);
    await this.EmployeeModel.insertMany(seed.employees);
    await this.SaleModel.insertMany(seed.sales);
    await this.TransferModel.insertMany(seed.transfers);
    this.hasSeeded = true;
    console.info(`[MongoDB] Seeded initial franchise data into ${this.dbName}`);
  }

  private normalizeMap(value: unknown): Record<string, number> {
    if (value instanceof Map) {
      return Object.fromEntries(value.entries()) as Record<string, number>;
    }
    return (value ?? {}) as Record<string, number>;
  }

  private toInventory(record: InventoryRecord | InventoryDoc): InventoryRecord {
    return {
      storeId: record.storeId,
      sku: record.sku,
      quantity: record.quantity,
      reserved: record.reserved,
      lastUpdated: record.lastUpdated,
    };
  }

  async listStores() {
    await this.ready();
    return this.StoreModel.find().sort({ name: 1 }).lean();
  }

  async listProducts() {
    await this.ready();
    return this.ProductModel.find().sort({ name: 1 }).lean();
  }

  async listEmployees() {
    await this.ready();
    return this.EmployeeModel.find().sort({ name: 1 }).lean();
  }

  async listTransfers() {
    await this.ready();
    return this.TransferModel.find().sort({ createdAt: -1 }).lean();
  }

  async listSales() {
    await this.ready();
    return this.SaleModel.find().sort({ soldAt: -1 }).lean();
  }

  async registerStore(store: Store) {
    await this.ready();
    if (await this.StoreModel.exists({ id: store.id })) {
      throw new Error(`Store ${store.id} already exists`);
    }

    await this.StoreModel.create(store);
    return store;
  }

  async addProduct(product: Product) {
    await this.ready();
    if (await this.ProductModel.exists({ sku: product.sku })) {
      throw new Error(`SKU ${product.sku} must be unique`);
    }

    await this.ProductModel.create(product);
    return product;
  }

  async registerEmployee(employee: Employee) {
    await this.ready();
    const store = await this.requireStore(employee.storeId);
    if (store.status !== 'active') {
      throw new Error('Employees can only be assigned to active stores');
    }
    if (await this.EmployeeModel.exists({ id: employee.id })) {
      throw new Error(`Employee ${employee.id} already exists`);
    }

    await this.EmployeeModel.create(employee);
    return employee;
  }

  async updateStock(storeId: string, sku: string, delta: number) {
    await this.ready();
    await this.requireStore(storeId);
    await this.requireProduct(sku);

    const record = await this.getOrCreateInventory(storeId, sku);
    if (record.quantity + delta < 0) {
      throw new Error('Stock cannot become negative');
    }

    record.quantity += delta;
    record.lastUpdated = new Date().toISOString();
    await record.save();
    return this.toInventory(record.toObject());
  }

  async createTransfer(fromStoreId: string, toStoreId: string, sku: string, quantity: number) {
    await this.ready();
    if (quantity <= 0) {
      throw new Error('Transfer quantity must be greater than zero');
    }

    const fromStore = await this.requireStore(fromStoreId);
    const toStore = await this.requireStore(toStoreId);
    await this.requireProduct(sku);

    if (fromStore.id === toStore.id) {
      throw new Error('Transfer must move stock between different stores');
    }

    const sourceInventory = await this.getOrCreateInventory(fromStoreId, sku);
    if (sourceInventory.quantity - quantity < 0) {
      throw new Error('Insufficient inventory for transfer');
    }

    sourceInventory.quantity -= quantity;
    sourceInventory.lastUpdated = new Date().toISOString();
    await sourceInventory.save();

    const transfer: Transfer = {
      id: `trf-${Date.now()}`,
      fromStoreId,
      toStoreId,
      sku,
      quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await this.TransferModel.create(transfer);
    return transfer;
  }

  async receiveTransfer(transferId: string) {
    await this.ready();
    const transfer = await this.TransferModel.findOne({ id: transferId });
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }
    if (transfer.status === 'received') {
      throw new Error('Transfer has already been received');
    }

    const destinationInventory = await this.getOrCreateInventory(transfer.toStoreId, transfer.sku);
    destinationInventory.quantity += transfer.quantity;
    destinationInventory.lastUpdated = new Date().toISOString();
    await destinationInventory.save();

    transfer.status = 'received';
    transfer.receivedAt = new Date().toISOString();
    await transfer.save();
    return transfer.toObject();
  }

  async recordSale(storeId: string, employeeId: string, items: SaleLineItem[]) {
    await this.ready();
    const store = await this.requireStore(storeId);
    if (store.status !== 'active') {
      throw new Error('Disabled stores cannot record sales');
    }

    const employee = await this.requireEmployee(employeeId);
    if (employee.storeId !== storeId || employee.status !== 'active') {
      throw new Error('Employees can only sell from their active store');
    }
    if (!items.length) {
      throw new Error('Sale requires at least one line item');
    }

    // Validate every line before mutating any document so partial stock updates never leak through.
    for (const item of items) {
      await this.requireProduct(item.sku);
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for ${item.sku}`);
      }
      const inventory = await this.getOrCreateInventory(storeId, item.sku);
      if (inventory.quantity - item.quantity < 0) {
        throw new Error(`Insufficient stock for ${item.sku}`);
      }
    }

    for (const item of items) {
      const inventory = await this.getOrCreateInventory(storeId, item.sku);
      inventory.quantity -= item.quantity;
      inventory.lastUpdated = new Date().toISOString();
      await inventory.save();
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      storeId,
      employeeId,
      soldAt: new Date().toISOString(),
      items,
      total,
      refundedItems: {},
    };

    await this.SaleModel.create(sale);
    return sale;
  }

  async refundSale(saleId: string, sku: string, quantity: number) {
    await this.ready();
    const sale = await this.SaleModel.findOne({ id: saleId });
    if (!sale) {
      throw new Error(`Sale ${saleId} not found`);
    }
    if (quantity <= 0) {
      throw new Error('Refund quantity must be greater than zero');
    }

    const line = sale.items.find((item) => item.sku === sku);
    if (!line) {
      throw new Error(`Sale ${saleId} does not contain SKU ${sku}`);
    }

    const refundedItems = this.normalizeMap(sale.refundedItems);
    const alreadyRefunded = refundedItems[sku] ?? 0;
    if (alreadyRefunded + quantity > line.quantity) {
      throw new Error('Refund quantity cannot exceed sold quantity');
    }

    refundedItems[sku] = alreadyRefunded + quantity;
    sale.refundedItems = refundedItems;
    await sale.save();

    const inventory = await this.getOrCreateInventory(sale.storeId, sku);
    inventory.quantity += quantity;
    inventory.lastUpdated = new Date().toISOString();
    await inventory.save();

    return {
      saleId,
      sku,
      refundedQuantity: quantity,
      totalRefundedQuantity: refundedItems[sku],
      inventory: this.toInventory(inventory.toObject()),
    };
  }

  async bulkImport(payload: {
    stores?: Store[];
    employees?: Employee[];
    products?: Product[];
    inventory?: Array<{ storeId: string; sku: string; quantity: number }>;
  }) {
    await this.ready();
    const summary: ImportSummary = {
      storesAdded: 0,
      employeesAdded: 0,
      productsAdded: 0,
      stockAdjustments: 0,
    };

    for (const store of payload.stores ?? []) {
      await this.registerStore(store);
      summary.storesAdded += 1;
    }

    for (const product of payload.products ?? []) {
      await this.addProduct(product);
      summary.productsAdded += 1;
    }

    for (const employee of payload.employees ?? []) {
      await this.registerEmployee(employee);
      summary.employeesAdded += 1;
    }

    for (const inventory of payload.inventory ?? []) {
      const record = await this.getOrCreateInventory(inventory.storeId, inventory.sku);
      if (inventory.quantity < 0) {
        throw new Error('Imported inventory cannot be negative');
      }
      record.quantity = inventory.quantity;
      record.lastUpdated = new Date().toISOString();
      await record.save();
      summary.stockAdjustments += 1;
    }

    return summary;
  }

  async getInventoryForStore(storeId: string) {
    await this.ready();
    return this.InventoryModel.find({ storeId }).lean();
  }

  async getDashboard(storeId?: string) {
    await this.ready();
    const stores = storeId
      ? await this.StoreModel.find({ id: storeId }).lean()
      : await this.StoreModel.find().lean();
    const storeIds = new Set(stores.map((store) => store.id));
    const inventory = await this.InventoryModel.find({ storeId: { $in: [...storeIds] } }).lean();
    const employees = await this.EmployeeModel.find({ storeId: { $in: [...storeIds] } }).lean();
    const sales = await this.SaleModel.find({ storeId: { $in: [...storeIds] } }).sort({ soldAt: -1 }).lean();
    const transfers = await this.TransferModel.find({
      $or: [{ fromStoreId: { $in: [...storeIds] } }, { toStoreId: { $in: [...storeIds] } }],
    }).sort({ createdAt: -1 }).lean();
    const products = await this.ProductModel.find().lean();

    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const lowStockItems = inventory
      .map((record) => ({
        ...record,
        product: products.find((product) => product.sku === record.sku),
      }))
      .filter((record) => record.product && record.quantity <= record.product.reorderPoint);

    return {
      stores,
      totals: {
        stores: stores.length,
        activeStores: stores.filter((store) => store.status === 'active').length,
        products: new Set(inventory.map((record) => record.sku)).size,
        employees: employees.length,
        sales: sales.length,
        revenue,
        pendingTransfers: transfers.filter((transfer) => transfer.status === 'pending').length,
      },
      lowStockItems,
      recentSales: sales.slice(0, 5).map((sale) => ({
        ...sale,
        refundedItems: this.normalizeMap(sale.refundedItems),
      })),
      recentTransfers: transfers.slice(0, 5),
    };
  }

  async getInventoryWidgetData(storeId?: string) {
    await this.ready();
    const records = (storeId
      ? await this.InventoryModel.find({ storeId }).lean()
      : await this.InventoryModel.find().lean());
    const stores = await this.StoreModel.find().lean();
    const products = await this.ProductModel.find().lean();

    const enriched = records.map((record) => {
      const store = stores.find((entry) => entry.id === record.storeId);
      const product = products.find((entry) => entry.sku === record.sku);
      if (!store || !product) {
        throw new Error(`Inventory reference missing for ${record.storeId}/${record.sku}`);
      }
      return {
        ...record,
        storeName: store.name,
        productName: product.name,
        category: product.category,
        reorderPoint: product.reorderPoint,
        status: record.quantity <= product.reorderPoint ? 'low' as const : 'healthy' as const,
      };
    });

    return {
      records: enriched,
      lowStockCount: enriched.filter((record) => record.status === 'low').length,
      categoryTotals: Object.entries(enriched.reduce<Record<string, number>>((acc, record) => {
        acc[record.category] = (acc[record.category] ?? 0) + record.quantity;
        return acc;
      }, {})).map(([category, quantity]) => ({ category, quantity })),
    };
  }

  async getSalesWidgetData(storeId?: string) {
    await this.ready();
    const sales = await this.SaleModel.find(storeId ? { storeId } : {}).sort({ soldAt: -1 }).lean();
    const stores = await this.StoreModel.find().lean();

    const enriched = sales.map((sale) => {
      const store = stores.find((entry) => entry.id === sale.storeId);
      if (!store) {
        throw new Error(`Store ${sale.storeId} not found`);
      }
      return {
        ...sale,
        refundedItems: this.normalizeMap(sale.refundedItems),
        storeName: store.name,
      };
    });

    return {
      sales: enriched,
      totalsByStore: Object.entries(enriched.reduce<Record<string, number>>((acc, sale) => {
        acc[sale.storeName] = (acc[sale.storeName] ?? 0) + sale.total;
        return acc;
      }, {})).map(([storeName, total]) => ({ storeName, total })),
    };
  }

  async getTransferWidgetData() {
    await this.ready();
    const transfers = await this.TransferModel.find().sort({ createdAt: -1 }).lean();
    const stores = await this.StoreModel.find().lean();
    const products = await this.ProductModel.find().lean();

    return transfers.map((transfer) => {
      const fromStore = stores.find((entry) => entry.id === transfer.fromStoreId);
      const toStore = stores.find((entry) => entry.id === transfer.toStoreId);
      const product = products.find((entry) => entry.sku === transfer.sku);
      if (!fromStore || !toStore || !product) {
        throw new Error(`Transfer reference missing for ${transfer.id}`);
      }
      return {
        ...transfer,
        fromStoreName: fromStore.name,
        toStoreName: toStore.name,
        productName: product.name,
      };
    });
  }

  async buildDailySalesReport(date: string) {
    await this.ready();
    const matchingSales = await this.SaleModel.find({ soldAt: new RegExp(`^${date}`) }).sort({ soldAt: -1 }).lean();
    const stores = await this.StoreModel.find().lean();

    const totalsByStore = Object.entries(matchingSales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.storeId] = (acc[sale.storeId] ?? 0) + sale.total;
      return acc;
    }, {})).map(([storeId, total]) => ({
      storeId,
      storeName: stores.find((store) => store.id === storeId)?.name ?? storeId,
      total,
    }));

    return {
      date,
      salesCount: matchingSales.length,
      totalRevenue: matchingSales.reduce((sum, sale) => sum + sale.total, 0),
      totalsByStore,
      topSales: matchingSales.slice(0, 5).map((sale) => ({
        ...sale,
        refundedItems: this.normalizeMap(sale.refundedItems),
      })),
    };
  }

  async buildWeeklyInventoryReport(storeId?: string) {
    const records = (await this.getInventoryWidgetData(storeId)).records;
    return {
      generatedAt: new Date().toISOString(),
      storeId: storeId ?? 'all',
      totalUnits: records.reduce((sum, record) => sum + record.quantity, 0),
      lowStockItems: records.filter((record) => record.status === 'low'),
      healthyItems: records.filter((record) => record.status === 'healthy').length,
      records,
    };
  }

  async buildMonthlyPerformanceReport(month: string) {
    await this.ready();
    const sales = await this.SaleModel.find({ soldAt: new RegExp(`^${month}`) }).lean();
    const stores = await this.StoreModel.find().lean();
    const employees = await this.EmployeeModel.find({ status: 'active' }).lean();

    const byStore = stores.map((store) => {
      const storeSales = sales.filter((sale) => sale.storeId === store.id);
      const revenue = storeSales.reduce((sum, sale) => sum + sale.total, 0);
      return {
        storeId: store.id,
        storeName: store.name,
        status: store.status,
        revenue,
        transactions: storeSales.length,
        employees: employees.filter((employee) => employee.storeId === store.id).length,
      };
    });

    return {
      month,
      stores: byStore,
      highestRevenueStore: [...byStore].sort((a, b) => b.revenue - a.revenue)[0] ?? null,
    };
  }

  async syncInventory() {
    await this.ready();
    const syncedAt = new Date().toISOString();
    await this.InventoryModel.updateMany({}, { $set: { lastUpdated: syncedAt } });
    const recordsSynced = await this.InventoryModel.countDocuments();
    const pendingTransfers = await this.TransferModel.countDocuments({ status: 'pending' });

    return {
      syncedAt,
      recordsSynced,
      pendingTransfers,
    };
  }

  private async requireStore(storeId: string) {
    const store = await this.StoreModel.findOne({ id: storeId }).lean();
    if (!store) {
      throw new Error(`Store ${storeId} not found`);
    }
    return store;
  }

  private async requireProduct(sku: string) {
    const product = await this.ProductModel.findOne({ sku }).lean();
    if (!product) {
      throw new Error(`Product ${sku} not found`);
    }
    return product;
  }

  private async requireEmployee(employeeId: string) {
    const employee = await this.EmployeeModel.findOne({ id: employeeId }).lean();
    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }
    return employee;
  }

  private async getOrCreateInventory(storeId: string, sku: string) {
    let record = await this.InventoryModel.findOne({ storeId, sku });
    if (record) {
      return record;
    }

    record = await this.InventoryModel.create({
      storeId,
      sku,
      quantity: 0,
      reserved: 0,
      lastUpdated: new Date().toISOString(),
    });
    return record;
  }
}
