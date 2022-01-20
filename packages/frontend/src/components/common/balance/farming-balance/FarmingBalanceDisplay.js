import BN from 'bn.js';
import React from 'react';
import { Translate } from 'react-localize-redux';
import styled from 'styled-components';

import classNames from '../../../../utils/classNames';
import { 
  showInYocto,
  YOCTO_NEAR_THRESHOLD
} from './../helpers';
import FarmingBalanceInUSD from './FarmingBalanceInUSD';


const StyledContainer = styled.div`
    white-space: nowrap;
    line-height: normal;

    .dots {
        color: #4a4f54;
        margin: 0 12px 0 0;

        :after {
            content: '.';
            animation: link 1s steps(5, end) infinite;

            @keyframes link {
                0%, 20% {
                    color: rgba(0,0,0,0);
                    text-shadow:
                        .3em 0 0 rgba(0,0,0,0),
                        .6em 0 0 rgba(0,0,0,0);
                }
                40% {
                    color: #4a4f54;
                    text-shadow:
                        .3em 0 0 rgba(0,0,0,0),
                        .6em 0 0 rgba(0,0,0,0);
                }
                60% {
                    text-shadow:
                        .3em 0 0 #4a4f54,
                        .6em 0 0 rgba(0,0,0,0);
                }
                80%, 100% {
                    text-shadow:
                        .3em 0 0 #4a4f54,
                        .6em 0 0 #4a4f54;
                }
            }
        }
    }

    &.subtract {
        .near-amount {
            :before {
                content: '-'
            }
        }
    }

    &:not(.fiat-only) {
        .fiat-amount {
            color: #72727A;
            font-weight: 400;
            margin-top: 2px;
            font-size: 13px;
        }
    }
`;

const FarmingBalanceDisplay = ({
    amount,
    showSymbol,
    className,
    showBalance = true,
    showBalanceInUSD = true,
    "data-test-id": testId,
    tokenMeta: {tokenPrice, tokenName, isWhiteListed} = {}
}) => {
   

    const symbol = tokenName;

    const handleShowInYocto = (amount) => {
        if (new BN(amount).lte(YOCTO_NEAR_THRESHOLD)) {
            return showInYocto(amount);
        } else {
            return '';
        }
    };

    const markIfNotNearAndNotWhitelisted = !isWhiteListed ? '#FF585D' : '';

    return (
        <StyledContainer
            title={handleShowInYocto(amount)}
            className={classNames([
                "balance",
                className,
                {
                    "fiat-only": !showBalance,
                },
            ])}
            data-test-id={testId}
        >
            {showBalance &&
                <>
                    {amount
                        ? <div className='near-amount' style={{color: markIfNotNearAndNotWhitelisted}}>{amount}{showSymbol !== false ? ` ${symbol}` : ``}</div>
                        : <div className="dots"><Translate id='loadingNoDots'/></div>
                    }
                </>
            }
            {showBalanceInUSD &&
                <div className='fiat-amount'>
                    <FarmingBalanceInUSD
                        amount={amount}
                        tokenMeta={{tokenPrice, isWhiteListed}}
                    />
                </div>
            }
        </StyledContainer>
    );
};

export default FarmingBalanceDisplay;