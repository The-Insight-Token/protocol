import { BigNumberish, BytesLike, constants, Signer, utils } from 'ethers';
import { AddressLike, randomAddress } from '@crestproject/crestproject';
import { IPolicy, PolicyManager } from '@melonproject/protocol';
import { encodeArgs } from '../../../common';

// Policy Manager

export enum policyHooks {
  PreBuyShares,
  PostBuyShares,
  PreCallOnIntegration,
  PostCallOnIntegration,
}

export async function generatePolicyManagerConfigWithMockPolicies({
  deployer,
  policyManager,
}: {
  deployer: Signer;
  policyManager: PolicyManager;
}) {
  const policies = await generateRegisteredMockPolicies({
    deployer,
    policyManager,
  });

  const policiesSettingsData = [
    utils.randomBytes(10),
    constants.HashZero,
    constants.HashZero,
    utils.randomBytes(2),
  ];

  return encodeArgs(
    ['address[]', 'bytes[]'],
    [Object.values(policies), policiesSettingsData],
  );
}

export async function generateRegisteredMockPolicies({
  deployer,
  policyManager,
}: {
  deployer: Signer;
  policyManager: PolicyManager;
}) {
  // Create mock policies
  const mockPreBuySharesPolicy = await IPolicy.mock(deployer);
  const mockPostBuySharesPolicy = await IPolicy.mock(deployer);
  const mockPreCoIPolicy = await IPolicy.mock(deployer);
  const mockPostCoIPolicy = await IPolicy.mock(deployer);

  // Initialize mock policy return values
  await Promise.all([
    // PreBuyShares
    mockPreBuySharesPolicy.identifier.returns(`MOCK_PRE_BUY_SHARES`),
    mockPreBuySharesPolicy.addFundSettings.returns(undefined),
    mockPreBuySharesPolicy.activateForFund.returns(undefined),
    mockPreBuySharesPolicy.validateRule.returns(true),
    mockPreBuySharesPolicy.implementedHooks.returns([policyHooks.PreBuyShares]),
    // PostBuyShares
    mockPostBuySharesPolicy.identifier.returns(`MOCK_POST_BUY_SHARES`),
    mockPostBuySharesPolicy.addFundSettings.returns(undefined),
    mockPostBuySharesPolicy.activateForFund.returns(undefined),
    mockPostBuySharesPolicy.validateRule.returns(true),
    mockPostBuySharesPolicy.implementedHooks.returns([
      policyHooks.PostBuyShares,
    ]),
    // PreCallOnIntegration
    mockPreCoIPolicy.identifier.returns(`MOCK_PRE_CALL_ON_INTEGRATION`),
    mockPreCoIPolicy.addFundSettings.returns(undefined),
    mockPreCoIPolicy.activateForFund.returns(undefined),
    mockPreCoIPolicy.validateRule.returns(true),
    mockPreCoIPolicy.implementedHooks.returns([
      policyHooks.PreCallOnIntegration,
    ]),
    // PostCallOnIntegration
    mockPostCoIPolicy.identifier.returns(`MOCK_POST_CALL_ON_INTEGRATION`),
    mockPostCoIPolicy.addFundSettings.returns(undefined),
    mockPostCoIPolicy.activateForFund.returns(undefined),
    mockPostCoIPolicy.validateRule.returns(true),
    mockPostCoIPolicy.implementedHooks.returns([
      policyHooks.PostCallOnIntegration,
    ]),
  ]);

  // Register all mock policies
  await policyManager.registerPolicies([
    mockPreBuySharesPolicy,
    mockPostBuySharesPolicy,
    mockPreCoIPolicy,
    mockPostCoIPolicy,
  ]);

  return {
    mockPreBuySharesPolicy,
    mockPostBuySharesPolicy,
    mockPreCoIPolicy,
    mockPostCoIPolicy,
  };
}

export async function policyManagerConfigArgs(
  policies: AddressLike[],
  settingsData: BytesLike[],
) {
  return encodeArgs(['address[]', 'bytes[]'], [policies, settingsData]);
}

export async function validateRulePreBuySharesArgs({
  buyer = randomAddress(),
  investmentAmount = utils.parseEther('1'),
  minSharesQuantity = utils.parseEther('1'),
  gav = 0,
}: {
  buyer?: AddressLike;
  investmentAmount?: BigNumberish;
  minSharesQuantity?: BigNumberish;
  gav?: BigNumberish;
}) {
  return encodeArgs(
    ['address', 'uint256', 'uint256', 'uint256'],
    [buyer, investmentAmount, minSharesQuantity, gav],
  );
}

export function validateRulePostBuySharesArgs(
  buyer: AddressLike,
  investmentAmount: BigNumberish,
  sharesBought: BigNumberish,
) {
  return encodeArgs(
    ['address', 'uint256', 'uint256'],
    [buyer, investmentAmount, sharesBought],
  );
}

export function validateRulePreCoIArgs(
  adapter: AddressLike,
  selector: BytesLike,
) {
  return encodeArgs(['address', 'bytes4'], [adapter, selector]);
}

export function validateRulePostCoIArgs(
  adapter: AddressLike,
  selector: BytesLike,
  incomingAssets: AddressLike[],
  incomingAssetAmounts: BigNumberish[],
  outgoingAssets: AddressLike[],
  outgoingAssetAmounts: BigNumberish[],
) {
  return encodeArgs(
    ['address', 'bytes4', 'address[]', 'uint256[]', 'address[]', 'uint256[]'],
    [
      adapter,
      selector,
      incomingAssets,
      incomingAssetAmounts,
      outgoingAssets,
      outgoingAssetAmounts,
    ],
  );
}

// Policies

export async function adapterBlacklistArgs(adapters: AddressLike[]) {
  return encodeArgs(['address[]'], [adapters]);
}

export async function adapterWhitelistArgs(adapters: AddressLike[]) {
  return encodeArgs(['address[]'], [adapters]);
}

export async function assetBlacklistArgs(assets: AddressLike[]) {
  return encodeArgs(['address[]'], [assets]);
}

export async function assetWhitelistArgs(assets: AddressLike[]) {
  return encodeArgs(['address[]'], [assets]);
}

export async function investorWhitelistArgs({
  investorsToAdd = [],
  investorsToRemove = [],
}: {
  investorsToAdd?: AddressLike[];
  investorsToRemove?: AddressLike[];
}) {
  return encodeArgs(
    ['address[]', 'address[]'],
    [investorsToAdd, investorsToRemove],
  );
}

export async function maxConcentrationArgs(maxConcentration: BigNumberish) {
  return encodeArgs(['uint256'], [maxConcentration]);
}