import { WiborData } from '../store/reducers/wiborReducer';
import { BaseCalculationParams, Installment } from '../types';

class SecondClaimCalculator {
  constructor(private wiborData: WiborData[]) {}

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    // return rate === 0 ? pv / nper : (rate * pv) / (1 - Math.pow(1 + rate, -nper));
    return rate === 0 ? pv / nper : pv * rate / (1 - Math.pow(1 + rate, -nper));
  }

  private getWiborRate(date: Date, type: 'wibor3m' | 'wibor6m'): number {
    if (!this.wiborData.length) return 0;

    const sortedWiborData = [...this.wiborData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const lastDateEntry = new Date(sortedWiborData[sortedWiborData.length - 1].date);

    if (date > lastDateEntry) {
      return sortedWiborData[sortedWiborData.length - 1][type] || 0;
    }

    const closestDateEntry = sortedWiborData.reduce((prev, curr) =>
      Math.abs(new Date(curr.date).getTime() - date.getTime()) < Math.abs(new Date(prev.date).getTime() - date.getTime()) ? curr : prev
    );

    return closestDateEntry[type] || 0;
  }

  public calculateInstallments(
    type: 'wibor3m' | 'wibor6m',
    params: BaseCalculationParams
  ): Installment[] {
    const { loanAmount, loanTerms, margin, firstInstallmentDate, installmentType } = params;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];
    const wiborRate = this.getWiborRate(new Date(firstInstallmentDate), type);
    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      const currentRate = margin + wiborRate;
      const interestPayment = (remainingAmount * currentRate) / 12 / 100;
      const principalPayment = installmentType === 'malejące'
        ? SecondClaimCalculator.calculatePMT(currentRate / 100 / 12, loanTerms - i, remainingAmount) - interestPayment
        : loanAmount / loanTerms;

      remainingAmount -= principalPayment;

      installments.push({
        date: currentDate,
        principal: principalPayment,
        interest: interestPayment,
        installment: principalPayment + interestPayment,
        wiborRate: currentRate,
        remainingAmount,
        wiborWithoutMargin: wiborRate,
      });
    }

    return installments;
  }
}

export default SecondClaimCalculator;
