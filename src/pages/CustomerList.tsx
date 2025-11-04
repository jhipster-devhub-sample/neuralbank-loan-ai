import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer } from "@/types/customer";
import { CustomerCard } from "@/components/CustomerCard";
import { API_BASE_URL } from "@/constants/api";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/customers?page=0&size=20`);
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        setCustomers(data.content || data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerClick = (identification: string) => {
    navigate(`/customer/${identification}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">N</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NeuralBank
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Financial Risk Evaluation AI Application Demo</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <h2 className="text-3xl font-bold text-card-foreground mb-6">Customer List</h2>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading customers...</span>
            </div>
          )}

          {error && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                Error loading customers: {error}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && customers.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No customers found.</p>
          )}

          {!isLoading && !error && customers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.identificacion}
                  customer={customer}
                  onClick={() => handleCustomerClick(customer.identificacion)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
