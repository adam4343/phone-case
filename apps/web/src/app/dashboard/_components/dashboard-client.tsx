"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, CheckCircle, XCircle, DollarSign } from "lucide-react";
import OrderCard from "./order-card";

export interface Order {
  id: string;
  price: number;
  isPaid: boolean;
  status?: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
  phoneCase: {
    id: string;
    image: string;
    croppedImage: string;
    color: { hex: string; name: string };
    model: { name: string };
    material: { name: string };
  };
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };
  billingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };
}

interface DashboardResponse {
  data: Order[];
  total: number;
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  
export const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

const fetchOrders = async (): Promise<DashboardResponse> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/order/dashboard`,
    {
      withCredentials: true, // Ensure cookies are sent
    }
  );
  return response.data;
};

const DashboardSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="pt-2 space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function DashboardClient() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const { data, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !sessionLoading && !!session?.user, 
    refetchInterval: 30000, 
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 400 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Dashboard</h1>
            <p className="text-gray-600">Loading session...</p>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error && (error as any)?.response?.status === 401) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Authentication Required</h3>
              <p className="text-red-700">Please log in to view your orders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && (error as any)?.response?.status === 400) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Dashboard</h1>
            <p className="text-gray-600">0 total orders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                    <p className="text-2xl font-bold text-green-600">0</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Orders will appear here once customers make purchases</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load orders</h3>
              <p className="text-red-700">
                {(error as any)?.response?.data?.error || 'Please try refreshing the page'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Dashboard</h1>
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${data?.total || 0} total orders`}
          </p>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{data.total}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.data.filter(order => order.isPaid).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(
                        data.data
                          .filter(order => order.isPaid)
                          .reduce((sum, order) => sum + order.price, 0)
                      )}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-4">
            {data?.data.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            
            {data?.data.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders will appear here once customers make purchases</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}