import { Customer } from "@/types/customer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CustomerDetailsProps {
  customer: Customer;
}

export const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
  const getRiskBadgeVariant = (risk: string) => {
    const riskLower = risk.toLowerCase();
    if (riskLower === "bajo") return "default";
    if (riskLower === "medio") return "secondary";
    return "destructive";
  };

  return (
    <Card className="p-6 bg-card border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-4">Customer Details</h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Full Name</p>
          <p className="text-lg font-semibold text-card-foreground">
            {customer.nombre} {customer.apellido}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Customer Type</p>
          <p className="text-lg text-card-foreground">{customer.tipoCliente}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Credit Score</p>
          <p className="text-2xl font-bold text-primary">{customer.scoreCrediticio}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Risk Level</p>
          <Badge variant={getRiskBadgeVariant(customer.nivelRiesgo)}>
            {customer.nivelRiesgo}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
