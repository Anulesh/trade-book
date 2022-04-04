/* eslint-disable no-debugger */
import produce from 'immer';
import React from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from 'react-query';
type sellBuy = {
  depth: string;
  limit_price: string;
  size: number;
  [key: string]: any;
};
interface OrderbookData {
  buy: sellBuy[];
  last_sequence_no: number;
  last_updated_at: number;
  product_id: number;
  sell: sellBuy[];
  symbol: string;
  timestamp: number;
  type: string;
}
enum typeTrade {
  'BUY',
  'SELL'
}
type looseObj = {
  [key: string]: sellBuy;
};
const tradeSizeUpdater = (
  oldTradeData: looseObj,
  newTradeData: OrderbookData['buy'],
  type = typeTrade.BUY
) => {
  const returnTradeSorted = newTradeData.map((d, idx) => {
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
  if (type === typeTrade.BUY) {
    returnTradeSorted.sort((a, b) => parseInt(b.limit_price) - parseInt(a.limit_price));
  } else {
    returnTradeSorted.sort((a, b) => parseInt(a.limit_price) - parseInt(b.limit_price));
  }
  return returnTradeSorted;
};
type WebSocketEvent = {
  type: string;
  payload: object;
};
type SubscribeEvent = {
  type: 'subscribe';
  payload: object;
};

// type UpdateEvent = {
//   operation: "update";
//   entity: Array<string>;
//   id: number;
//   payload: Partial<PostDetailData>;
// };
function useOrderbookSubscription<Data>(
  //cb: (data: object) => void,
  queryKey: string[],
  channelName = 'L2_ORDERBOOK',
  useQueryOptions: UseQueryOptions<Data> = {}
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
      queryClient.setQueryData(queryKey, () => {
        //console.log('hey', tradeData);
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
              draftData.buy = tradeSizeUpdater(oldDataBuy, buy, typeTrade.BUY);
              draftData.sell = tradeSizeUpdater(oldDataSell, sell, typeTrade.SELL);
            }
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
  return {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    data: useQuery<OrderbookData, Error>(queryKey, () => new Promise<OrderbookData>(() => {})),
    action: (input: WebSocketEvent) => websocket.current?.send(JSON.stringify(input))
  };
}
export default useOrderbookSubscription;
