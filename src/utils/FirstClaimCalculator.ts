import { BaseCalculationParams, Installment } from '../types';

class FirstClaimCalculator {

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    return rate === 0 ? pv / nper : (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  }


  public calculateInstallments(
    params: BaseCalculationParams,
  ): Installment[] {
    const { loanAmount, loanTerms, margin, firstInstallmentDate, installmentType } = params;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);


      // Use only the margin for calculations, ignoring WIBOR
      const currentRate = margin;
      const interestPayment = (remainingAmount * currentRate) / 12 / 100;
      const principalPayment = installmentType === 'malejące'
        ? FirstClaimCalculator.calculatePMT(currentRate / 100 / 12, loanTerms - i, remainingAmount) - interestPayment
        : loanAmount / loanTerms;

      remainingAmount -= principalPayment;

      installments.push({
        date: currentDate,
        principal: principalPayment,
        interest: interestPayment,
        installment: principalPayment + interestPayment,
        wiborRate: currentRate, 
        remainingAmount,
        wiborWithoutMargin: 0, 
      });
    }

    return installments;
  }
}

export default FirstClaimCalculator;
