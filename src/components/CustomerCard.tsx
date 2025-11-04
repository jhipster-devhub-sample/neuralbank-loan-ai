import { Customer } from "@/types/customer";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
}

export const CustomerCard = ({ customer, onClick }: CustomerCardProps) => {
  return (
    <Card
      className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-border bg-card group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            {customer.nombre} {customer.apellido}
          </h3>
          <p className="text-sm text-muted-foreground">
            {customer.tipoCliente}
          </p>
        </div>
        <ArrowRight className="text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
    </Card>
  );
};
