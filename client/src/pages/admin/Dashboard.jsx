import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGetDashboardStatsQuery } from "@/features/api/adminApi";
import PageLoader from "@/components/PageLoader";

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) {
    return <PageLoader/>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{data?.data.totalUsers || 0}</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Courses Published</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{data?.data.totalCourses || 0}</p>
        </CardContent>
      </Card>

      {/* Growth Chart Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Growth Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
