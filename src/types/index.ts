export interface DynamicField {
  date: Date;
  amount: number;
}

export interface BaseCalculationParams {
  loanAmount: number;
  loanTerms: number;
  margin: number;
  wiborRate: number;
  startDate: Date;
  firstInstallmentDate: Date;
  gracePeriodMonths: number;
  holidayMonths: DynamicField[];
  prepayments: DynamicField[];
  disbursements: DynamicField[];
  installmentType: "równe" | "malejące";
  endDate: string | Date;
  borrower: string;
  currentRate: number;
}

export interface Installment {
  date: Date;
  principal: number;
  interest: number;
  installment: number;
  wiborRate: number;
  remainingAmount: number;
  wiborWithoutMargin: number;
}
