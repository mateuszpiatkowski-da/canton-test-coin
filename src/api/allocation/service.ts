import { CoinAllocation } from '@daml-ts/test-coin-1.0.0/lib/Coin/Allocation/Allocation';
import ContractService from 'src/api/common/contract';

class AllocationService {
  public async getAllocation(cid: string) {
    const contractService = new ContractService(cid, CoinAllocation.templateId);
    return await contractService.getDisclosedContract();
  }
}

const service = new AllocationService();
export default service;
