import { CoinTransferFactory, CoinTransferInstruction } from '@daml-ts/test-coin-1.0.0/lib/Coin/Transfer/module';
import FetchTemplateFactory from 'src/api/common/templateFactory';
import ContractService from 'src/api/common/contract';

class TransferService extends FetchTemplateFactory {
  constructor() {
    super(CoinTransferFactory.templateId);
  }

  public async getTransferInstruction(cid: string) {
    const contractService = new ContractService(cid, CoinTransferInstruction.templateId);
    return await contractService.getDisclosedContract();
  }
}

const service = new TransferService();
export default service;
