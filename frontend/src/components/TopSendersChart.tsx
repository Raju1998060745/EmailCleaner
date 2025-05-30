import React, { useEffect, useRef } from 'react';
import { TopSender } from '../types';
import { deleteSender } from "../utils/api";

interface TopSendersChartProps {
  isLoading: boolean;
  data: TopSender[];
  onRefresh: () => void; 
}

const TopSendersChart: React.FC<TopSendersChartProps> = ({ isLoading, data, onRefresh }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isLoading && data.length > 0 && chartRef.current) {
      // Animation for bars
      const bars = chartRef.current.querySelectorAll('.bar-fill');
      bars.forEach((bar, index) => {
        setTimeout(() => {
          (bar as HTMLElement).style.width = `${(data[index].count / data[0].count) * 100}%`;
        }, index * 100);
      });
    }
  }, [isLoading, data]);

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Loading top senders...</h2>
        <div className="flex justify-center my-8">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-gray-400">
          Analyzing your email patterns
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">No Data Available</h2>
        <p className="text-center text-gray-400">
          There's no sender data to display. Try syncing your inbox first.
        </p>
      </div>
    );
  }

  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);
  const maxCount = sortedData[0].count;

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-6">Top Email Senders</h2>

      <div ref={chartRef} className="space-y-4">
        {sortedData.map((sender, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{sender.email}</span>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">
                  {sender.count} emails
                </span>

                {/* REMOVE button */}
                <button
                  className="text-sm text-red-400 hover:underline"
                  onClick={async () => {
                    const ok = confirm(
                      `Delete all ${sender.count} emails from:\n\n${sender.email}?`
                    );
                    if (!ok) return;

                    try {
                      const n = await deleteSender(sender.email);
                      alert(`Deleted ${n} emails from ${sender.email}.`);
                      onRefresh();               // ③ reload chart
                    } catch (err) {
                      alert("Delete failed – see console.");
                      console.error(err);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* bar visual – unchanged */}
            <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="bar-fill h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: "0%",
                  background: `linear-gradient(to right,
                    hsl(${210 + index * 15}, 70%, 50%),
                    hsl(${210 + index * 15}, 80%, 60%))`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights card – unchanged */}
    </div>
  );
};

export default TopSendersChart;