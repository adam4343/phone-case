import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

export default function OrderStatusBadge({isPaid}: {isPaid: boolean}) {
    if (isPaid) {
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      }
      
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
}