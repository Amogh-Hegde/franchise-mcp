import { ExecutionContext, Injectable, ResourceDecorator as Resource } from '@nitrostack/core';
import { FranchiseDataService } from './franchise.data.js';

@Injectable({ deps: [FranchiseDataService] })
export class FranchiseResources {
  constructor(private readonly data: FranchiseDataService) {}

  @Resource({
    uri: 'franchise://company-policies',
    name: 'Company Policies',
    description: 'Operating rules and guardrails for the franchise network.',
    mimeType: 'application/json',
  })
  async companyPolicies(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading company policies');

    const policies = {
      sellingRules: [
        'Disabled stores cannot record sales.',
        'Employees may only transact from their active home store.',
        'Refunds cannot exceed the quantity sold for a SKU.',
      ],
      inventoryRules: [
        'SKU values must be unique across the catalog.',
        'Stock cannot drop below zero.',
        'Transfers require sufficient source inventory.',
      ],
      staffingRules: [
        'Employees can only be registered to active stores.',
      ],
      taskCoverage: [
        'Daily sales report',
        'Weekly inventory report',
        'Bulk import',
        'Inventory sync',
        'Monthly performance report',
      ],
    };

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(policies, null, 2),
      }],
    };
  }

  @Resource({
    uri: 'franchise://product-categories',
    name: 'Product Categories',
    description: 'Product categories plus live catalog counts from the current data store.',
    mimeType: 'application/json',
  })
  async productCategories(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading product categories');

    const products = await this.data.listProducts();
    const categories = Object.entries(products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {})).map(([category, productCount]) => ({
      category,
      productCount,
    }));

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          categories,
          products,
        }, null, 2),
      }],
    };
  }
}
