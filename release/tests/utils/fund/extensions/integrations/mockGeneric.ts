import { AddressLike } from '@crestproject/crestproject';
import { MockGenericAdapter, StandardToken } from '@melonproject/utils';
import { BigNumberish, BytesLike, Signer, utils } from 'ethers';
import {
  ComptrollerLib,
  IntegrationManager,
  VaultLib,
} from '../../../../../utils/contracts';
import { encodeArgs, sighash } from '../../../common';
import { callOnIntegrationArgs, integrationManagerActionIds } from './common';

export const mockGenericSwapASelector = sighash(
  utils.FunctionFragment.fromString('swapA(address,bytes,bytes)'),
);
export const mockGenericSwapBSelector = sighash(
  utils.FunctionFragment.fromString('swapB(address,bytes,bytes)'),
);
export const mockGenericSwapCSelector = sighash(
  utils.FunctionFragment.fromString('swapC(address,bytes,bytes)'),
);

export async function mockGenericSwapArgs({
  spendAssets,
  spendAssetAmounts,
  incomingAssets,
  minIncomingAssetAmounts,
  incomingAssetAmounts,
}: {
  spendAssets: AddressLike[];
  spendAssetAmounts: BigNumberish[];
  incomingAssets: AddressLike[];
  minIncomingAssetAmounts: BigNumberish[];
  incomingAssetAmounts: BigNumberish[];
}) {
  return encodeArgs(
    ['address[]', 'uint256[]', 'address[]', 'uint256[]', 'uint256[]'],
    [
      spendAssets,
      spendAssetAmounts,
      incomingAssets,
      minIncomingAssetAmounts,
      incomingAssetAmounts,
    ],
  );
}

export async function mockGenericSwap({
  comptrollerProxy,
  vaultProxy,
  integrationManager,
  fundOwner,
  mockGenericAdapter,
  selector = mockGenericSwapASelector,
  spendAssets = [],
  spendAssetAmounts = [],
  incomingAssets = [],
  minIncomingAssetAmounts = [],
  actualIncomingAssetAmounts = [],
  seedFund = false,
}: {
  comptrollerProxy: ComptrollerLib;
  vaultProxy: VaultLib;
  integrationManager: IntegrationManager;
  fundOwner: Signer;
  mockGenericAdapter: MockGenericAdapter;
  selector?: BytesLike;
  spendAssets?: StandardToken[];
  spendAssetAmounts?: BigNumberish[];
  incomingAssets?: StandardToken[];
  minIncomingAssetAmounts?: BigNumberish[];
  actualIncomingAssetAmounts?: BigNumberish[];
  seedFund?: boolean;
}) {
  // Seed the VaultProxy with enough spendAssets for the tx
  if (seedFund) {
    for (const key in spendAssets) {
      await spendAssets[key].transfer(vaultProxy, spendAssetAmounts[key]);
    }
  }

  const swapArgs = await mockGenericSwapArgs({
    spendAssets,
    spendAssetAmounts,
    incomingAssets,
    minIncomingAssetAmounts,
    incomingAssetAmounts: actualIncomingAssetAmounts,
  });
  const callArgs = await callOnIntegrationArgs({
    adapter: mockGenericAdapter,
    selector,
    encodedCallArgs: swapArgs,
  });

  const swapTx = comptrollerProxy
    .connect(fundOwner)
    .callOnExtension(
      integrationManager,
      integrationManagerActionIds.CallOnIntegration,
      callArgs,
    );
  await expect(swapTx).resolves.toBeReceipt();

  return swapTx;
}