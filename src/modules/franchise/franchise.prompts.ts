import { ExecutionContext, Injectable, PromptDecorator as Prompt } from '@nitrostack/core';
import { FranchiseDataService } from './franchise.data.js';

@Injectable({ deps: [FranchiseDataService] })
export class FranchisePrompts {
  constructor(private readonly data: FranchiseDataService) {}

  @Prompt({
    name: 'inventory_recommendation',
    description: 'Create replenishment recommendations using the live franchise inventory snapshot.',
    arguments: [
      { name: 'storeId', description: 'Optional store ID to narrow the recommendation', required: false },
    ],
  })
  async inventoryRecommendation(args: { storeId?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Building inventory recommendation prompt', args);
    const inventory = await this.data.getInventoryWidgetData(args.storeId);

    return [
      {
        role: 'system',
        content: 'You are an inventory planner for a franchise business. Recommend practical reorder actions only.',
      },
      {
        role: 'user',
        content: `Using this inventory snapshot, recommend which SKUs need replenishment first and why:\n${JSON.stringify(inventory, null, 2)}`,
      },
    ];
  }

  @Prompt({
    name: 'sales_summary',
    description: 'Summarise sales performance using the current revenue snapshot.',
    arguments: [
      { name: 'storeId', description: 'Optional store ID for a single-store summary', required: false },
    ],
  })
  async salesSummary(args: { storeId?: string }, ctx: ExecutionContext) {
    ctx.logger.info('Building sales summary prompt', args);
    const sales = await this.data.getSalesWidgetData(args.storeId);

    return [
      {
        role: 'system',
        content: 'You are a retail operations analyst. Summaries should be concise, numeric, and action-oriented.',
      },
      {
        role: 'user',
        content: `Summarise the following franchise sales data, highlight the strongest store, and call out any worrying trends:\n${JSON.stringify(sales, null, 2)}`,
      },
    ];
  }

  @Prompt({
    name: 'store_performance_review',
    description: 'Generate a store performance review prompt using monthly KPIs and staffing context.',
    arguments: [
      { name: 'month', description: 'Month prefix in YYYY-MM format', required: true },
    ],
  })
  async storePerformanceReview(args: { month: string }, ctx: ExecutionContext) {
    ctx.logger.info('Building performance review prompt', args);
    const report = await this.data.buildMonthlyPerformanceReport(args.month);

    return [
      {
        role: 'system',
        content: 'You are a franchise performance coach. Review stores fairly, identify root causes, and suggest next actions.',
      },
      {
        role: 'user',
        content: `Review this monthly franchise performance report and produce a store-by-store assessment:\n${JSON.stringify(report, null, 2)}`,
      },
    ];
  }
}
