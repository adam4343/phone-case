import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, type Order } from "./dashboard-client";
import { DollarSign, Package } from "lucide-react";
import OrderStatusBadge from "./order-status-badge";

  
export default function OrderCard({order, key}: {order: Order, key: string}) {
    return  <Card className="hover:shadow-md transition-all duration-200 border border-gray-100">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Package className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-gray-900">
              Order #{order.id.slice(-8)}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              {formatDate(order.createdAt)}
            </CardDescription>
          </div>
        </div>
        <OrderStatusBadge isPaid={order.isPaid} />
      </div>
    </CardHeader>
    
    <CardContent className="pt-0">
      <div className="flex items-start space-x-4">
        <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={order.phoneCase.croppedImage || order.phoneCase.image}
            alt="Phone case"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-gray-500">Model:</span>
              <span className="ml-1 text-gray-900 font-medium">{order.phoneCase.model.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Material:</span>
              <span className="ml-1 text-gray-900 font-medium">{order.phoneCase.material.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500">Color:</span>
              <div className="ml-2 flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: order.phoneCase.color.hex }}
                />
                <span className="text-gray-900 font-medium">{order.phoneCase.color.name}</span>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 text-gray-500" />
              <span className="text-gray-900 font-semibold">{formatCurrency(order.price)}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              <div className="font-medium">{order.shippingAddress.name}</div>
              <div>
                {order.shippingAddress.street}, {order.shippingAddress.city}
              </div>
              <div>
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
}