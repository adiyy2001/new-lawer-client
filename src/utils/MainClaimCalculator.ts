import { WiborData } from '../store/reducers/wiborReducer';
import { BaseCalculationParams, Installment } from '../types';

class MainClaimCalculator {
  constructor(private wiborData: WiborData[]) {}

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    return rate === 0
      ? pv / nper
      : (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  }

  private getWiborRate(date: Date, type: 'wibor3m' | 'wibor6m'): number {
    const freezeDate = new Date();

    if (date >= freezeDate) {
      const freezeWiborRateEntry = this.wiborData.find(
        (entry) => new Date(entry.date).getTime() === freezeDate.getTime()
      );
      return freezeWiborRateEntry ? freezeWiborRateEntry[type] : 0;
    }

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

  private static formatDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public calculateInstallments(
    type: 'wibor3m' | 'wibor6m',
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
    } = params;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];
    const prepaymentMap = new Map(
      prepayments.map((p) => [
        MainClaimCalculator.formatDateOnly(new Date(p.date)),
        p.amount,
      ])
    );
    const disbursementMap = new Map(
      disbursements.map((d) => [
        MainClaimCalculator.formatDateOnly(new Date(d.date)),
        d.amount,
      ])
    );
    const holidayMonthsSet = new Set(
      holidayMonths.map((h) =>
        MainClaimCalculator.formatDateOnly(new Date(h.date))
      )
    );

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      const formattedDate = MainClaimCalculator.formatDateOnly(currentDate);

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

      let wiborRate;
      wiborRate = this.getWiborRate(currentDate, type);

      const currentRate = margin + wiborRate;
      const monthlyRate = currentRate / 12 / 100;

      const interestPayment = remainingAmount * monthlyRate;
      let principalPayment = 0;

      if (i >= gracePeriodMonths) {
        if (installmentType === 'równe') {
          const annuityPayment = MainClaimCalculator.calculatePMT(
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
        wiborWithoutMargin: wiborRate,
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

export default MainClaimCalculator;
