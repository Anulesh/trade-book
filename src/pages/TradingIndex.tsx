import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { productSymbol } from '../constants/constants';
import OrderBookTable from '../components/OrderBookTable';
import ProductsDropDownModal from '../components/ProductsDropDownModal';
import { L2_ORDERBOOK } from '../types/PropTypes';
import useOrderbookSubscription from '../customHooks/useOrderbookSubscription';

const TradingIndex = () => {
  const location = useLocation();
  const state = location.state as { from: string };
  const pathname = location.pathname;
  const [queryKey, setQueryKey] = useState([productSymbol[0], L2_ORDERBOOK]);
  const { data, action } = useOrderbookSubscription();
  useEffect(() => {
    if (state) {
      action({
        type: 'unsubscribe',
        payload: {
          channels: [
            {
              name: L2_ORDERBOOK,
              symbols: [state.from]
            }
          ]
        }
      });
    }

    action({
      type: 'subscribe',
      payload: {
        channels: [
          {
            name: L2_ORDERBOOK,
            symbols: [pathname.substring(1)]
          }
        ]
      }
    });
    setQueryKey([pathname.substring(1), L2_ORDERBOOK]);
  }, [pathname]);
  // useEffect(() => {
  //   if (data.isSuccess) {
  //     console.log(data.data);
  //   }
  // }, [data]);

  return (
    <>
      <ProductsDropDownModal dropDownOptions={productSymbol} />
      <OrderBookTable tradeData={data} />
    </>
  );
};
export default TradingIndex;
