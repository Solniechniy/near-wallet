import React, { useEffect, useState } from 'react';
import { Translate } from 'react-localize-redux';
import { useDispatch, useSelector } from 'react-redux';

import { Mixpanel } from '../../../mixpanel';
import { redirectTo } from '../../../redux/actions/account';
import { clearCurrentValidator, selectCurrentValidator } from '../../../redux/actions/staking';
import { actionsPending } from '../../../utils/alerts';
import { FARMING_VALIDATOR_VERSION } from '../../../utils/constants';
import FormButton from '../../common/FormButton';
import SafeTranslate from '../../SafeTranslate';
import AlertBanner from './AlertBanner';
import BalanceBox from './BalanceBox';
import ClaimConfirmModal from './ClaimConfirmModal';
import FarmingBalanceBox from './FarmingBalanceBox';
import StakeConfirmModal from './StakeConfirmModal';
import StakingFee, { StakingAPY } from './StakingFee';

export default function Validator({
    match,
    validator,
    onWithdraw,
    loading,
    selectedValidator,
    currentValidators,
    accountId,
}) {
    const [confirm, setConfirm] = useState(null);
    const currentValidator = useSelector(state => state.staking.currentValidator);
    const isFarmingValidator = validator?.version === FARMING_VALIDATOR_VERSION;

    const dispatch = useDispatch();
    const stakeNotAllowed = !!selectedValidator && selectedValidator !== match.params.validator && !!currentValidators.length;
    const showConfirmModal = confirm === 'withdraw' || confirm === 'claimFarmRewards';

    const [showClaimConfirmModal, setShowClaimConfirmModal] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState(null);

    const handleStakeAction = async () => {
        if (showConfirmModal && !loading) {
            await onWithdraw('withdraw', selectedValidator || validator.accountId);
            setConfirm('done');
        }
    };

    const handleClaimAction = async () => {
        console.log('CLAIMING ACTION');
    };

    useEffect(() => {
        if (!isFarmingValidator || !validator?.accountId ) return;
        dispatch(selectCurrentValidator(validator.accountId, accountId));

        return () => {
            dispatch(clearCurrentValidator());
        };
    }, [validator?.accountId, isFarmingValidator]);

    return (
        <>
            {stakeNotAllowed
                ? <AlertBanner
                    title='staking.alertBanner.title'
                    button='staking.alertBanner.button'
                    linkTo={`/staking/${selectedValidator}`}
                />
                : null
            }
            <h1 data-test-id="validatorNamePageTitle">
                <SafeTranslate
                    id="staking.validator.title"
                    data={{ validator: match.params.validator }}
                />
            </h1>
            <FormButton
                linkTo={`/staking/${match.params.validator}/stake`}
                disabled={(stakeNotAllowed || !validator) ? true : false}
                trackingId="STAKE Click stake with validator button"
                data-test-id="validatorPageStakeButton"
            >
                <Translate id='staking.validator.button' />
            </FormButton>
            {validator && <StakingFee fee={validator.fee.percentage} />}
            {isFarmingValidator && <StakingAPY apy={currentValidator.calculatedAPY} />}
            {validator && !stakeNotAllowed && !actionsPending('UPDATE_STAKING') &&
                <>
                    <BalanceBox
                        title='staking.balanceBox.staked.title'
                        info='staking.balanceBox.staked.info'
                        amount={validator.staked || '0'}
                        onClick={() => {
                            dispatch(redirectTo(`/staking/${match.params.validator}/unstake`));
                            Mixpanel.track("UNSTAKE Click unstake button");
                        }}
                        button='staking.balanceBox.staked.button'
                        buttonColor='gray-red'
                        loading={loading}
                    />
                    <BalanceBox
                        title='staking.balanceBox.unclaimed.title'
                        info='staking.balanceBox.unclaimed.info'
                        amount={validator.unclaimed || '0'}
                    />
                    <BalanceBox
                        title='staking.balanceBox.pending.title'
                        info='staking.balanceBox.pending.info'
                        amount={validator.pending || '0'}
                        disclaimer='staking.validator.withdrawalDisclaimer'
                    />
                    <BalanceBox
                        title='staking.balanceBox.available.title'
                        info='staking.balanceBox.available.info'
                        amount={validator.available || '0'}
                        onClick={() => {
                            setConfirm('withdraw');
                            Mixpanel.track("WITHDRAW Click withdraw button");
                        }}
                        button='staking.balanceBox.available.button'
                        loading={loading}
                    />
                    {currentValidator?.accountId && isFarmingValidator && (
                            <>
                            <h3>
                                <Translate
                                    id="staking.validator.availableForClaim"
                                />
                            </h3>
                            {currentValidator.farmRewards.length ? currentValidator.farmRewards?.map(farmReward => (
                                <FarmingBalanceBox
                                    key={farmReward.farmId}
                                    info="staking.balanceBox.farmAvailable.info"
                                    amount={farmReward.amount || '0'}
                                    tokenMeta={{
                                        tokenPrice: farmReward.tokenPrice,
                                        tokenId: farmReward.tokenId,
                                        tokenName: farmReward.tokenName,
                                        isWhiteListed: farmReward.isWhiteListed,
                                        farmTitle: farmReward.farmTitle
                                    }}
                                    onClick={() => {
                                        setSelectedFarm(farmReward);
                                        setShowClaimConfirmModal(true);
                                        // // Mixpanel.track(
                                        // //     "CLAIM Click claim button"
                                        // // );
                                    }}
                                    button="staking.balanceBox.farm.button"
                                    loading={loading}
                                />
                            )) : <h4><Translate id={'staking.validator.nothingToClaim'}/></h4>}
                            {showClaimConfirmModal && <ClaimConfirmModal
                                title={`staking.validator.claimFarmRewards`}
                                label="staking.stake.from"
                                validator={currentValidator}
                                amount={selectedFarm.amount}
                                open={showClaimConfirmModal}
                                onConfirm={handleClaimAction}
                                onClose={() => setShowClaimConfirmModal(false)}
                                loading={loading}
                                tokenMeta={{
                                    tokenPrice: selectedFarm.tokenPrice,
                                    tokenId: selectedFarm.tokenId,
                                    tokenName: selectedFarm.tokenName,
                                    isWhiteListed: selectedFarm.isWhiteListed,
                                    farmTitle: selectedFarm.farmTitle
                                }}
                                // sendingString="claiming"
                            />
}
                            </>
                        )}
                        {showConfirmModal && (
                            <StakeConfirmModal
                                title={`staking.validator.${confirm}`}
                                label="staking.stake.from"
                                validator={validator}
                                amount={validator.available}
                                open={showConfirmModal}
                                onConfirm={handleStakeAction}
                                onClose={() => setConfirm(null)}
                                loading={loading}
                                sendingString="withdrawing"
                            />
                        )}
                </>
            }
        </>
    );
}