import { CoinAllocationInstructionFactory } from '@daml-ts/test-coin-1.0.0/lib/Coin/Allocation/Instruction';
import FetchTemplateFactory from 'src/api/common/factory';

class AllocationInstructionService extends FetchTemplateFactory {
  constructor() {
    super(CoinAllocationInstructionFactory.templateId);
  }
}

const service = new AllocationInstructionService();
export default service;
