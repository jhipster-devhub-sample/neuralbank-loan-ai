export interface Customer {
  identificacion: string;
  nombre: string;
  apellido: string;
  tipoCliente: string;
  scoreCrediticio: number;
  nivelRiesgo: string;
}

export interface LoanApplication {
  loanAmount: number;
  installments: number;
  monthlyIncome: number;
}

export interface LoanDecision {
  approved: boolean;
  reason?: string;
  requiresAction?: boolean;
}
