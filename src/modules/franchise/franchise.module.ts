import { Module } from '@nitrostack/core';
import { FranchiseTools } from './franchise.tools.js';
import { FranchiseResources } from './franchise.resources.js';
import { FranchisePrompts } from './franchise.prompts.js';
import { FranchiseDataService } from './franchise.data.js';

@Module({
  name: 'franchise',
  description: 'Franchise store operations for NitroStack',
  controllers: [FranchiseTools, FranchiseResources, FranchisePrompts],
  providers: [FranchiseDataService],
})
export class FranchiseModule {}
