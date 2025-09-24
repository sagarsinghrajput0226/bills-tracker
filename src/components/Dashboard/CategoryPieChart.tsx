import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CATEGORY_EMOJIS } from '../../types/Expense';

interface CategoryPieChartProps {
  data: Record<string, number>;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const pieData = Object.entries(data)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      emoji: CATEGORY_EMOJIS[category] || '📝'
    }))
    .sort((a, b) => b.value - a.value);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6b7280'
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 12
      },
      formatter: (params: any) => {
        const percentage = params.percent;
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">
              ${params.data.emoji} ${params.name}
            </div>
            <div style="color: #3b82f6;">₹${params.value.toFixed(2)}</div>
            <div style="color: #6b7280; font-size: 11px;">${percentage}%</div>
          </div>
        `;
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: {
        color: '#6b7280',
        fontSize: 11
      },
      formatter: (name: string) => {
        const item = pieData.find(d => d.name === name);
        return `${item?.emoji} ${name}`;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.data.emoji}\n${params.percent}%`;
            }
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: pieData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: '300px', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
};
