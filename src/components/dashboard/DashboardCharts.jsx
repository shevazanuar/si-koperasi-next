"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-2xl">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
             <p className="text-sm font-bold text-gray-900">
               {entry.name}: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.value)}
             </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ data }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full h-full min-h-[400px]">
      
      {/* Savings Trend (Area Chart) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-gray-800">Tren Simpanan (6 Bln terakhir)</h3>
           <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-black uppercase">Growth</div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSimpanan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B47B5A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#B47B5A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="simpanan" 
                name="Simpanan"
                stroke="#B47B5A" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSimpanan)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Loans Distribution (Bar Chart) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-gray-800">Penyaluran Pinjaman</h3>
           <div className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded font-black uppercase">Volume</div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="pinjaman" 
                name="Pinjaman"
                fill="#D19A62" 
                radius={[6, 6, 0, 0]}
                barSize={30}
                animationDuration={2000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
