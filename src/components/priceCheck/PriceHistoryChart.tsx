
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { mockPriceHistoryData, mockAuctionPriceHistoryData } from './utils/mockData';
import { useModeContext } from '@/context/ModeContext';
import { History } from 'lucide-react';

interface PriceHistoryPoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
  loading: boolean;
  isPremium: boolean;
  currentPrice: number;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  data,
  loading,
  isPremium,
  currentPrice
}) => {
  const { isAuctionMode } = useModeContext();
  
  // Generate mock data if we don't have real data, based on current mode
  const chartData = data.length > 0 
    ? data 
    : isAuctionMode 
      ? mockAuctionPriceHistoryData 
      : mockPriceHistoryData;
  
  // Calculate if current price is a good deal compared to history
  const avgHistoricalPrice = chartData.reduce((sum, point) => sum + point.price, 0) / chartData.length;
  const isPriceGood = currentPrice < avgHistoricalPrice;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 text-xs rounded shadow-sm">
          <p className="font-medium mb-1">{formatDate(label)}</p>
          <p className="text-primary flex items-center">
            <span>Price: </span>
            <span className="font-medium ml-1">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // If not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <Card className="mb-3 shadow-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Price History</span>
            <Badge variant="outline" className="border-gray-200 text-gray-600">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="bg-muted/30 rounded-md p-4 text-center border border-gray-100">
            <p className="text-xs text-muted-foreground">
              Upgrade to Premium to see price history trends for this item
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-3 shadow-sm">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>30-Day Price History</span>
          {loading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <Badge variant={isPriceGood ? "success" : "secondary"} className={`${isPriceGood ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
              {isPriceGood ? 'Good Deal' : 'Average Price'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {loading ? (
          <Skeleton className="h-36 w-full" />
        ) : (
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{fontSize: 10}}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  dy={10}
                />
                <YAxis 
                  width={40}
                  tickFormatter={(value) => `$${value}`}
                  tick={{fontSize: 10}}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#1EAEDB" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#1EAEDB", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Enhanced historical average indicator with better visibility */}
            <div className="flex items-center my-4 p-3 bg-blue-50 rounded-md border border-blue-100 border-l-4 border-l-primary">
              <History className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <div className="flex justify-between items-center w-full">
                <span className="text-gray-800 text-sm font-medium">Historical Average:</span>
                <span className="text-primary font-bold text-base">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD' 
                  }).format(avgHistoricalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceHistoryChart;
