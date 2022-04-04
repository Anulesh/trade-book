/* eslint-disable no-debugger */
import produce from 'immer';
import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { OrderbookData, looseObj, sellBuy, L2_ORDERBOOK, typeTrade } from '../types/PropTypes';

const cumulativePriceCalculater = (orderBook: sellBuy[], type: typeTrade) => {
  const cumulativeArr = produce(orderBook, (draftOrderBook) => {
    if (type === typeTrade.SELL) draftOrderBook.reverse();
    draftOrderBook.forEach((order, index) => {
      if (index === 0) {
        order['cumulativePrice'] = parseFloat(order.limit_price);
      } else {
        order['cumulativePrice'] =
          parseFloat(draftOrderBook[index - 1]['cumulativePrice']) + parseFloat(order.limit_price);
      }
    });
    if (type === typeTrade.SELL) draftOrderBook.reverse();
  });
  return cumulativeArr;
};
const tradeSizeUpdater = (oldTradeData: looseObj, newTradeData: OrderbookData['buy']) => {
  const returnTradeSorted = newTradeData.map((d) => {
    const dataToModify = { ...d };
    dataToModify['sizeChange'] = 0;
    // eslint-disable-next-line no-prototype-builtins
    if (oldTradeData && oldTradeData.hasOwnProperty(d.limit_price)) {
      if (oldTradeData[dataToModify.limit_price].size > dataToModify.size) {
        dataToModify['sizeChange'] = -1;
      } else {
        dataToModify['sizeChange'] = +1;
      }
    }
    return dataToModify;
  });
  return returnTradeSorted;
};
type WebSocketEvent = {
  type: string;
  payload: object;
};

function useOrderbookSubscription(
  //cb: (data: object) => void,
  channelName = L2_ORDERBOOK
) {
  const queryClient = useQueryClient();
  const websocket = React.useRef<WebSocket>();
  const tradeData = React.useRef<OrderbookData>();
  React.useEffect(() => {
    websocket.current = new WebSocket('wss://production-esocket.delta.exchange ');
    websocket.current.onopen = () => {
      console.log('connected');
    };
    websocket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      queryClient.setQueryData(channelName, () => {
        const sendData = produce<OrderbookData>(data, (draftData) => {
          if (tradeData.current && draftData) {
            if (draftData.type === channelName && tradeData.current.type === channelName) {
              const { buy, sell } = draftData;
              const oldDataBuy = tradeData.current?.buy.reduce(function (map, obj) {
                map[obj.limit_price] = obj;
                return map;
              }, {} as looseObj);
              const oldDataSell = tradeData.current?.sell.reduce(function (map, obj) {
                map[obj.limit_price] = obj;
                return map;
              }, {} as looseObj);
              draftData.buy = tradeSizeUpdater(oldDataBuy, buy);
              draftData.sell = tradeSizeUpdater(oldDataSell, sell);
            }
          }
          if (draftData.type === channelName) {
            draftData.buy.sort((a, b) => parseFloat(b.limit_price) - parseFloat(a.limit_price));
            draftData.sell.sort((a, b) => parseFloat(b.limit_price) - parseFloat(a.limit_price));
            draftData.buy = cumulativePriceCalculater(draftData.buy, typeTrade.BUY);
            draftData.sell = cumulativePriceCalculater(draftData.sell, typeTrade.SELL);
          }
        });
        return sendData;
      });
      tradeData.current = data;
    };
    return () => {
      websocket.current?.close();
    };
  }, [queryClient]);
  let timer: number;
  const eventAction = (input: WebSocketEvent) => {
    clearInterval(timer);
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current?.send(JSON.stringify(input));
    } else {
      timer = window.setInterval(() => eventAction(input), 2000);
    }
  };
  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    data: useQuery<OrderbookData, Error>(channelName, () => new Promise<OrderbookData>(() => {})),
    action: eventAction
  };
}
export default useOrderbookSubscription;
