import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Customer } from "@/types/customer";
import { CustomerDetails } from "@/components/CustomerDetails";
import { LoanApplicationForm } from "@/components/LoanApplicationForm";
import { API_BASE_URL } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAuthHeaders } from "@/utils/auth";

const LoanApplication = () => {
  const { identification } = useParams<{ identification: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!identification) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/customers/identification/${identification}`,
          {
            headers: getAuthHeaders(),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch customer details");
        }
        const data = await response.json();
        setCustomer(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [identification]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer List
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">N</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NeuralBank
            </h1>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading customer details...</span>
          </div>
        )}

        {error && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Error loading customer: {error}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && customer && (
          <div className="grid lg:grid-cols-2 gap-6">
            <CustomerDetails customer={customer} />
            <LoanApplicationForm customer={customer} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplication;
