import { WiborData } from "../store/reducers/wiborReducer";
import { BaseCalculationParams, Installment } from "../types";

class MainClaimCalculator {
  private unknownWiborDate: Date | null = null;

  constructor(private wiborData: WiborData[]) {
    if (this.wiborData.length > 0) {
      const sortedWiborData = [...this.wiborData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (let i = 1; i < sortedWiborData.length; i++) {
        const prevDate = new Date(sortedWiborData[i - 1].date);
        const currDate = new Date(sortedWiborData[i].date);
        const diffInMonths =
          (currDate.getFullYear() - prevDate.getFullYear()) * 12 +
          (currDate.getMonth() - prevDate.getMonth());

        if (diffInMonths > (sortedWiborData[i].wibor3m ? 3 : 6)) {
          this.unknownWiborDate = currDate;
          break;
        }
      }

      if (!this.unknownWiborDate) {
        this.unknownWiborDate = new Date(
          sortedWiborData[sortedWiborData.length - 1].date
        );
      }
    }
  }

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    return rate === 0
      ? pv / nper
      : (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  }

  private getWiborRate(date: Date, type: "wibor3m" | "wibor6m"): number {
    if (
      !this.wiborData.length ||
      (this.unknownWiborDate && date >= this.unknownWiborDate)
    )
      return 0;

    const sortedWiborData = [...this.wiborData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const lastDateEntry = new Date(
      sortedWiborData[sortedWiborData.length - 1].date
    );

    if (date > lastDateEntry) {
      return sortedWiborData[sortedWiborData.length - 1][type] || 0;
    }

    const closestDateEntry = sortedWiborData.reduce((prev, curr) =>
      Math.abs(new Date(curr.date).getTime() - date.getTime()) <
      Math.abs(new Date(prev.date).getTime() - date.getTime())
        ? curr
        : prev
    );

    return closestDateEntry[type] || 0;
  }

  private static formatDateOnly(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  public calculateInstallments(
    type: "wibor3m" | "wibor6m",
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

    const annuityPayment = MainClaimCalculator.calculatePMT(
      (margin + this.getWiborRate(new Date(firstInstallmentDate), type)) /
        100 /
        12,
      loanTerms,
      loanAmount
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

      let principalPayment = 0;
      let wiborRate = this.getWiborRate(currentDate, type);

      if (i % (type === "wibor3m" ? 3 : 6) === 0) {
        wiborRate = this.getWiborRate(currentDate, type);
      }

      const currentRate = wiborRate === 0 ? 0 : margin + wiborRate;
      const interestPayment = (remainingAmount * currentRate) / 12 / 100;

      if (i >= gracePeriodMonths) {
        if (installmentType === "równe") {
          // Raty równe (annuitetowe)
          principalPayment = annuityPayment - interestPayment;
        } else {
          // Raty malejące
          principalPayment = remainingAmount / (loanTerms - i);
        }
        remainingAmount -= principalPayment;
      }

      installments.push({
        date: currentDate,
        principal: principalPayment,
        interest: interestPayment,
        installment: principalPayment + interestPayment,
        wiborRate: wiborRate === 0 ? 0 : currentRate,
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
