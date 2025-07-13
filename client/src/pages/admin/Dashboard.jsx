import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGetDashboardStatsQuery } from "@/features/api/adminApi";
import PageLoader from "@/components/loadingUi/PageLoader";

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) {
    return <PageLoader/>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-[#18181b] rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-gray-700 dark:text-gray-400 text-lg font-semibold">Total Users</span>
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{data?.data.totalUsers || 0}</span>
        </div>
        <div className="bg-white dark:bg-[#18181b] rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-gray-700 dark:text-gray-400 text-lg font-semibold">Courses Published</span>
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{data?.data.totalCourses || 0}</span>
        </div>
      </div>
      {/* Chart */}
      <div className="bg-white dark:bg-[#18181b] rounded-lg shadow p-6 w-full min-h-[350px]">
        <h2 className="text-gray-800 dark:text-gray-300 text-lg font-semibold mb-4">Growth Overview</h2>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.data.monthlyStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                name="Users"
                stroke="#4a90e2"
                strokeWidth={3}
                dot={{ stroke: "#4a90e2", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="courses"
                name="Courses"
                stroke="#34d399"
                strokeWidth={3}
                dot={{ stroke: "#34d399", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
