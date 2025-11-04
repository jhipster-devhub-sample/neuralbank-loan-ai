import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Customer, LoanApplication } from "@/types/customer";
import { calculateLoanDecision } from "@/utils/loanCalculations";
import { Loader2, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface LoanApplicationFormProps {
  customer: Customer;
}

export const LoanApplicationForm = ({ customer }: LoanApplicationFormProps) => {
  const [formData, setFormData] = useState<LoanApplication>({
    loanAmount: 0,
    installments: 0,
    monthlyIncome: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<ReturnType<typeof calculateLoanDecision> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      const result = calculateLoanDecision(customer, formData);
      setDecision(result);
      setIsProcessing(false);
    }, 1000);
  };

  const handleInputChange = (field: keyof LoanApplication, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
    setDecision(null); // Reset decision when form changes
  };

  return (
    <Card className="p-6 bg-card border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-6">Loan Application</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="loanAmount">Loan Amount</Label>
          <Input
            id="loanAmount"
            type="number"
            min="0"
            step="100"
            required
            value={formData.loanAmount || ""}
            onChange={(e) => handleInputChange("loanAmount", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="installments">Number of Installments (Months)</Label>
          <Input
            id="installments"
            type="number"
            min="1"
            max="360"
            required
            value={formData.installments || ""}
            onChange={(e) => handleInputChange("installments", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="monthlyIncome">Monthly Income</Label>
          <Input
            id="monthlyIncome"
            type="number"
            min="0"
            step="100"
            required
            value={formData.monthlyIncome || ""}
            onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>

      {decision && (
        <div className="mt-6">
          {!decision.approved ? (
            <Alert className="border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-semibold">
                Loan Rejected: {decision.reason}
              </AlertDescription>
            </Alert>
          ) : decision.requiresAction ? (
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning-foreground" />
              <AlertDescription className="text-warning-foreground font-semibold">
                Action Required: {decision.reason}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-success bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success font-semibold">
                {decision.reason}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
};
