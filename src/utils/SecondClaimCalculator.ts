import { BaseCalculationParams, Installment } from '../types';

class SecondClaimCalculator {
  constructor() {}

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    // Rata annuitetowa (równa) lub prosta (malejąca)
    return rate === 0
      ? pv / nper
      : (pv * rate) / (1 - Math.pow(1 + rate, -nper));
  }

  private static formatDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public calculateInstallments(params: BaseCalculationParams): Installment[] {
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
      wiborRate, // <- WIBOR z dnia umowy, przekazywany z frontu lub parametru
    } = params;

    // WIBOR z dnia umowy (np. 5,29) + marża (np. 1,00) = 6,29% rocznie
    // Uwaga na interpretację: w wiborRate przekazujemy WYŁĄCZNIE WIBOR
    // a margin to marża. Stopa końcowa => currentRate = margin + wiborRate.
    const fixedWibor = wiborRate ?? 0;
    const fixedRate = margin + fixedWibor; // np. 6,29
    const monthlyRate = fixedRate / 12 / 100;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];

    // Mapy do szybkiego wyszukiwania nadpłat i transz
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

    // Zbiór "wakacyjnych" miesięcy
    const holidayMonthsSet = new Set(
      holidayMonths.map((h) =>
        SecondClaimCalculator.formatDateOnly(new Date(h.date))
      )
    );

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      const formattedDate = SecondClaimCalculator.formatDateOnly(currentDate);

      // Wakacje kredytowe => rata 0, odsetki 0, brak spłat kapitału
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

      // Dodajemy ewentualną transzę, jeśli w tym miesiącu była wypłata
      remainingAmount += disbursementMap.get(formattedDate) || 0;

      // Odsetki od bieżącego kapitału
      const interestPayment = remainingAmount * monthlyRate;
      let principalPayment = 0;

      // Karencja dotyczy zazwyczaj kapitału, więc jeśli i < gracePeriodMonths, to spłacamy tylko odsetki
      if (i >= gracePeriodMonths) {
        if (installmentType === 'równe') {
          // Rata annuitetowa
          const annuityPayment = SecondClaimCalculator.calculatePMT(
            monthlyRate,
            loanTerms - i, // liczba pozostałych rat
            remainingAmount
          );
          principalPayment = annuityPayment - interestPayment;
        } else {
          // Rata malejąca
          principalPayment = remainingAmount / (loanTerms - i);
        }
        remainingAmount -= principalPayment;
      }

      // Zapisujemy ratę do tabeli
      installments.push({
        date: currentDate,
        principal: principalPayment,
        interest: interestPayment,
        installment: principalPayment + interestPayment,
        // wiborRate = kolumna G = marża + WIBOR
        wiborRate: fixedRate,
        remainingAmount,
        // wiborWithoutMargin = kolumna F = sam WIBOR
        wiborWithoutMargin: fixedWibor,
      });

      // Nadpłata
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
