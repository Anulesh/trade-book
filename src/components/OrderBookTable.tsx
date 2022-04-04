import { useEffect, useReducer, useState } from 'react';
import { UseQueryResult } from 'react-query';
import BuySell from '../icons/BuySell.svg';
import Sell from '../icons/Sell.svg';
import Buy from '../icons/Buy.svg';

import styled from 'styled-components';

import { EventData, L2_ORDERBOOK, sellBuy, toggleOrderBookActionsType } from '../types/PropTypes';
import PopOver from './PopOver';
const PopOverTableContainer = styled.div`
  background: rgb(25, 34, 45);
  color: white;
  width: 50%;
  margin: 0 auto;
  border-radius: 2px;
  padding: 16px;
  .header {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    height: 40px;
    background-color: rgb(31, 42, 53);
    width: 100%;
    -webkit-box-pack: start;
    justify-content: center;
    border-radius: 2px;
  }
  .toggle-books {
    background-color: rgb(33, 41, 52);
    display: flex;
    -webkit-box-pack: justify;
    justify-content: space-evenly;
    padding: 5px;
    border-radius: 2px;
    margin-top: 5px;
    img {
      cursor: pointer;
    }
  }
  #order_book_table {
    display: none;
  }
  div[role='table'] {
    /* height: 90vh;
    overflow: auto; */
  }
  div[role='rowgroup'] {
    display: flex;
    flex-direction: column;
    &.reverse-flex {
      flex-direction: column-reverse;
    }
  }
  div[role='row'] {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    &:nth-child(2n + 1) {
      background: rgba(4, 13, 25, 0.25);
    }
    &:nth-child(2n) {
      background: rgb(25, 34, 45);
    }
  }
  div[role='row']:hover,
  div[role='row']:hover ~ div[role='row'] {
    opacity: 0.57;
    background-color: rgb(48, 61, 78);
  }
  .size-change {
    position: relative;
    color: rgb(212, 212, 212);
    width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    span.blink {
      width: 100%;
      position: absolute;
      top: -10px;
      left: 0;
      height: 40px;
      border-radius: 2px;
      &.green {
        background: rgb(84, 185, 134);
        fill: rgb(84, 185, 134);
        opacity: 0.2;
        animation: 0.5s ease 0s 1 normal none running fadeanimation;
        color: rgb(255, 255, 255) !important;
      }
      &.red {
        background: rgb(215, 87, 80);
        fill: rgb(215, 87, 80);
        opacity: 0.2;
        animation: 0.5s ease 0s 1 normal none running fadeanimation;
        color: rgb(255, 255, 255) !important;
      }
      @keyframes fadeanimation {
        10% {
          opacity: 0;
        }
        25% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }
    }
  }
`;
const OrderDetailsFlex = styled.div`
  display: flex;
  min-width: 150px;
  padding: 5px;
  justify-content: space-between;
  span.left {
    margin-right: 25px;
  }
`;
type OrderBookTablePropTypes = {
  tradeData: UseQueryResult<EventData, Error>;
};
const initialToggleState = toggleOrderBookActionsType.BOTH;

const reducer = (state: toggleOrderBookActionsType, action: toggleOrderBookActionsType) => {
  switch (action) {
    case toggleOrderBookActionsType.BOTH:
      return toggleOrderBookActionsType.BOTH;
    case toggleOrderBookActionsType.BUY:
      return toggleOrderBookActionsType.BUY;
    case toggleOrderBookActionsType.SELL:
      return toggleOrderBookActionsType.SELL;
    default:
      return toggleOrderBookActionsType.BOTH;
  }
};

const OrderBookTable = ({ tradeData }: OrderBookTablePropTypes) => {
  const [popoverPosition, setPopoverPostion] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [currentOrderType, setCurrentOrderType] = useState('buy');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderbookRecord, setOrderbookRecord] = useState<sellBuy>();
  useEffect(() => {
    if (tradeData.isSuccess && tradeData.data.type === L2_ORDERBOOK) {
      setOrderbookRecord(tradeData.data ? tradeData.data[currentOrderType][currentIndex] : null);
    }
  }, [tradeData, currentOrderType, currentIndex]);
  const handleMouseOver = (
    event: React.SyntheticEvent<HTMLDivElement> | React.SyntheticEvent<HTMLSpanElement>
  ) => {
    setCurrentIndex(parseInt(event.currentTarget?.dataset?.index || '0'));
    setCurrentOrderType(event.currentTarget?.dataset?.type || 'buy');
    setShowPopover(true);
    setPopoverPostion(event.currentTarget?.offsetTop - 17.5);
  };
  const handleMouseOut = () => {
    setShowPopover(false);
    //console.log('evt current', evt.currentTarget)
  };
  const [toggleState, dispatch] = useReducer(reducer, initialToggleState);
  return (
    <>
      {tradeData.isSuccess && tradeData.data.type === L2_ORDERBOOK ? (
        <PopOverTableContainer>
          <div className="header">Order Book</div>
          <div className="toggle-books">
            <img
              src={BuySell}
              alt="Buy/Sell Book Toggle"
              onClick={() => dispatch(toggleOrderBookActionsType.BOTH)}
            />
            <img
              src={Buy}
              alt="Buy Book Toggle"
              onClick={() => dispatch(toggleOrderBookActionsType.BUY)}
            />
            <img
              src={Sell}
              alt="Sell Book Toggle"
              onClick={() => dispatch(toggleOrderBookActionsType.SELL)}
            />
          </div>
          <div role="table" aria-label="Order Book Table" aria-describedby="order_book_table">
            <PopOver show={showPopover} popoverPosition={popoverPosition}>
              <OrderDetailsFlex>
                <span className="left">Avg Price</span>
                <span>
                  {orderbookRecord
                    ? `~${(orderbookRecord['cumulativePrice'] / (currentIndex + 1)).toFixed(1)}`
                    : ''}
                </span>
              </OrderDetailsFlex>
              <OrderDetailsFlex>
                <span>Amount</span>
                <span>{orderbookRecord ? orderbookRecord.depth : ''}</span>
              </OrderDetailsFlex>
            </PopOver>
            <div id="order_book_table">Order Book Table with Buy/Sell/Both data</div>
            <div role="rowgroup">
              <div role="row">
                <span role="columnheader" aria-sort="none">
                  Price
                </span>
                <span role="columnheader" aria-sort="none">
                  Size (Cont)
                </span>
                <span role="columnheader" aria-sort="none">
                  Total (Cont)
                </span>
              </div>
            </div>
            {toggleState === toggleOrderBookActionsType.SELL ||
            toggleState === toggleOrderBookActionsType.BOTH ? (
              <div role="rowgroup">
                {tradeData.data.sell.map((sellData, index) => (
                  <div
                    role="row"
                    aria-rowindex={index}
                    key={index}
                    data-index={index}
                    data-type="sell"
                    onMouseOverCapture={handleMouseOver}
                    onMouseOut={handleMouseOut}
                  >
                    <span role="cell">{sellData.limit_price}</span>
                    <div className="size-change" role="cell">
                      <span
                        className={
                          sellData['sizeChange'] === 1
                            ? 'blink green'
                            : sellData['sizeChange'] === -1
                            ? 'blink red'
                            : 'blink'
                        }
                      ></span>
                      <span role="cell">{sellData.size}</span>
                    </div>
                    <span role="cell">{sellData.depth}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {toggleState === toggleOrderBookActionsType.BUY ||
            toggleState === toggleOrderBookActionsType.BOTH ? (
              <div role="rowgroup" className="reverse-flex">
                {tradeData.data.buy
                  .slice(0)
                  .reverse()
                  .map((buyData, index) => (
                    <div
                      role="row"
                      aria-rowindex={index + tradeData.data.sell.length}
                      key={index + tradeData.data.sell.length}
                      data-index={tradeData.data.buy.length - index - 1}
                      data-type="buy"
                      onMouseOverCapture={handleMouseOver}
                      onMouseOut={handleMouseOut}
                    >
                      <span role="cell">{buyData.limit_price}</span>
                      <div className="size-change" role="cell">
                        <span
                          className={
                            buyData['sizeChange'] === 1
                              ? 'blink green'
                              : buyData['sizeChange'] === -1
                              ? 'blink red'
                              : 'blink'
                          }
                        ></span>
                        <span role="cell">{buyData.size}</span>
                      </div>
                      <span role="cell">{buyData.depth}</span>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        </PopOverTableContainer>
      ) : null}
    </>
  );
};
export default OrderBookTable;
