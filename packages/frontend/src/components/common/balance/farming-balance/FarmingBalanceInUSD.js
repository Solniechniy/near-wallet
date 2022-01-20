import React from 'react';
import { Translate } from 'react-localize-redux';

import AlertRoundedIcon from '../../../svg/AlertRoundedIcon';
import Tooltip from '../../Tooltip';

const FarmingBalanceInUSD = ({
    amount,
    tokenMeta: {tokenPrice, isWhiteListed} = {}
}) => {

    const USDSymbol = 'USD';
    return (
        <>
            <div style={{color: isWhiteListed ? '' : '#FF585D', display: 'flex', whiteSpace: 'normal'}}>
                { tokenPrice 
                    ? `≈ $${tokenPrice * amount} ${USDSymbol}`
                    : <Translate id='tokenBox.priceUnavailable'/>
                }
                {!isWhiteListed && <Tooltip translate={'staking.validator.notWhiteListedWarning'}>
                    <AlertRoundedIcon/>
                </Tooltip>}
            </div>
            
        </>
    );
};

export default FarmingBalanceInUSD;