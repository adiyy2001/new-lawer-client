import { BaseCalculationParams, Installment } from "../types";

class SecondClaimCalculator {
  constructor() {}

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    return rate === 0
      ? pv / nper
      : (pv * rate) / (1 - Math.pow(1 + rate, -nper));
  }

  private static formatDateOnly(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  public calculateInstallments(
    params: BaseCalculationParams
  ): Installment[] {
    const {
      loanAmount,
      loanTerms,
      margin,
      firstInstallmentDate,
      gracePeriodMonths,
      holidayMonths,
      prepayments,
      disbursements,
      installmentType,
      wiborRate, 
    } = params;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];
    const prepaymentMap = new Map(
      prepayments.map((p) => [
        SecondClaimCalculator.formatDateOnly(new Date(p.date)),
        p.amount,
      ])
    );
    const disbursementMap = new Map(
      disbursements.map((d) => [
        SecondClaimCalculator.formatDateOnly(new Date(d.date)),
        d.amount,
      ])
    );
    const holidayMonthsSet = new Set(
      holidayMonths.map((h) =>
        SecondClaimCalculator.formatDateOnly(new Date(h.date))
      )
    );

    const fixedWiborRate = wiborRate !== undefined ? wiborRate : 0; // Używamy stałej wartości WIBOR
    const currentRate = margin + fixedWiborRate;
    const monthlyRate = currentRate / 12 / 100;

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      const formattedDate = SecondClaimCalculator.formatDateOnly(currentDate);

      if (holidayMonthsSet.has(formattedDate)) {
        installments.push({
          date: currentDate,
          principal: 0,
          interest: 0,
          installment: 0,
          wiborRate: 0,
          remainingAmount,
          wiborWithoutMargin: 0,
        });
        continue;
      }

      remainingAmount += disbursementMap.get(formattedDate) || 0;

      const interestPayment = remainingAmount * monthlyRate;
      let principalPayment = 0;

      if (i >= gracePeriodMonths) {
        if (installmentType === "równe") {
          const annuityPayment = SecondClaimCalculator.calculatePMT(
            monthlyRate,
            loanTerms - i,
            remainingAmount
          );
          principalPayment = annuityPayment - interestPayment;
        } else {
          principalPayment = remainingAmount / (loanTerms - i);
        }
        remainingAmount -= principalPayment;
      }

      installments.push({
        date: currentDate,
        principal: principalPayment,
        interest: interestPayment,
        installment: principalPayment + interestPayment,
        wiborRate: currentRate,
        remainingAmount,
        wiborWithoutMargin: fixedWiborRate,
      });

      const prepaymentAmount = prepaymentMap.get(formattedDate) ?? 0;
      if (prepaymentAmount > 0) {
        remainingAmount -= prepaymentAmount;
        installments.push({
          date: currentDate,
          principal: prepaymentAmount,
          interest: 0,
          installment: prepaymentAmount,
          wiborRate: 0,
          remainingAmount,
          wiborWithoutMargin: 0,
        });
      }
    }

    return installments;
  }
}

export default SecondClaimCalculator;
