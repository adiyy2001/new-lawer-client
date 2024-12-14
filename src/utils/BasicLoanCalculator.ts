import { WiborData } from "../store/reducers/wiborReducer";
import { BaseCalculationParams, Installment } from "../types";

class BasicLoanCalculator {
  constructor(private wiborData: WiborData[]) {}

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    return rate === 0
      ? pv / nper
      : (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  }

  private getWiborRate(date: Date, type: "wibor3m" | "wibor6m"): number {
    if (!this.wiborData.length) return 0;

    const sortedWiborData = [...this.wiborData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const closestDateEntry = sortedWiborData.reduce((prev, curr) =>
      Math.abs(new Date(curr.date).getTime() - date.getTime()) <
      Math.abs(new Date(prev.date).getTime() - date.getTime())
        ? curr
        : prev
    );

    return closestDateEntry[type] || 0;
  }

  public calculateInstallments(
    type: "wibor3m" | "wibor6m",
    params: BaseCalculationParams,
    includeWibor: boolean
  ): Installment[] {
    const {
      loanAmount,
      loanTerms,
      margin,
      firstInstallmentDate,
      installmentType,
    } = params;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];

    const today = new Date();
    let lastKnownWiborRate = 0;
    let wiborRate = this.getWiborRate(new Date(firstInstallmentDate), type);

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      if (currentDate > today) {
        // Use last known WIBOR rate for future installments
        wiborRate = lastKnownWiborRate;
      } else {
        // Update WIBOR rate for past installments
        if (i % (type === "wibor3m" ? 3 : 6) === 0) {
          wiborRate = this.getWiborRate(currentDate, type);
          lastKnownWiborRate = wiborRate;
        }
      }

      const currentRate = includeWibor ? margin + wiborRate : margin;
      const monthlyRate = currentRate / 12 / 100;

      const interestPayment = remainingAmount * monthlyRate;
      let principalPayment: number;

      if (installmentType === "równe") {
        const annuityPayment = BasicLoanCalculator.calculatePMT(
          monthlyRate,
          loanTerms - i,
          remainingAmount
        );
        principalPayment = annuityPayment - interestPayment;
      } else {
        principalPayment = remainingAmount / (loanTerms - i);
      }

      const totalInstallment = principalPayment + interestPayment;

      remainingAmount -= principalPayment;

      installments.push({
        date: new Date(currentDate),
        principal: principalPayment,
        interest: interestPayment,
        installment: totalInstallment,
        wiborRate: currentRate,
        remainingAmount,
        wiborWithoutMargin: includeWibor ? wiborRate : 0,
      });
    }

    return installments;
  }
}

export default BasicLoanCalculator;
