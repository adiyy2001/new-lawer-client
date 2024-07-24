export interface BaseCalculationParams {
  loanAmount: number;
  loanTerms: number;
  margin: number;
  firstInstallmentDate: string;
  installmentType: 'stałe' | 'malejące';
}

export interface ExtendedCalculationParams extends BaseCalculationParams {
  gracePeriodMonths: number;
  disbursements: { date: string; amount: number }[];
  prepayments: { date: string; amount: number }[];
  holidayMonths: { date: string }[];
}

export interface Installment {
  date: Date;
  principal: number;
  interest: number;
  installment: number;
  remainingAmount: number;
  wiborRate: number;
  wiborWithoutMargin: number;
}
