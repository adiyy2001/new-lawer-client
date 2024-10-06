import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import {
  TextInput,
  NumberInput,
  DateInput,
  DynamicFieldArray,
  SelectInput,
} from "./shared/form/components";
import Spinner from "./shared/spinner/Spinner";

const LOCAL_STORAGE_KEY = "loanParams";

const ParametersForm: React.FC = () => {
  const loading = useSelector((state: AppState) => state.wibor.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const getDefaultValues = (): any => {
    const savedParams = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedParams) {
      return JSON.parse(savedParams);
    }
    return {
      borrower: "JAN KOWALSKI",
      loanAmount: 180000,
      loanTerms: 300,
      margin: 1.99,
      startDate: new Date("2011-08-19"),
      firstInstallmentDate: new Date("2011-09-07"),
      gracePeriodMonths: 0,
      holidayMonths: [],
      prepayments: [],
      disbursements: [],
      installmentType: "malejące",
      endDate: new Date("2011-12-19"),
      currentRate: 3.5,
      wiborRate: 4.30,
    };
  };

  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const savedParams = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedParams) {
      reset(JSON.parse(savedParams));
    }
  }, [reset]);

  const onSubmit = async (data: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      navigate("/basic-calculations", { state: { data } });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-100 p-6 rounded-lg shadow-md mb-4"
    >
      <h2 className="text-xl font-bold mb-4">Wprowadź parametry kredytu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          label="Kredytobiorca"
          control={control}
          name="borrower"
          rules={{ required: "Kredytobiorca jest wymagany" }}
        />
        <NumberInput
          label="Kwota kredytu (zł)"
          control={control}
          name="loanAmount"
          rules={{
            required: "Kwota kredytu jest wymagana",
            min: { value: 1, message: "Kwota musi być większa niż 0" },
          }}
        />
        <NumberInput
          label="Ilość rat"
          control={control}
          name="loanTerms"
          rules={{
            required: "Ilość rat jest wymagana",
            min: { value: 1, message: "Ilość rat musi być większa niż 0" },
          }}
        />
        <DateInput
          label="Data podpisania"
          control={control}
          name="startDate"
          rules={{ required: "Data podpisania jest wymagana" }}
        />
        <DateInput
          label="Data pierwszej raty"
          control={control}
          name="firstInstallmentDate"
          rules={{ required: "Data pierwszej raty jest wymagana" }}
        />
        <NumberInput
          label="Marża (%)"
          control={control}
          name="margin"
          rules={{
            required: "Marża jest wymagana",
            min: { value: 0.01, message: "Marża musi być większa niż 0" },
          }}
        />
        <NumberInput
          label="Karencja (miesiące)"
          control={control}
          name="gracePeriodMonths"
          rules={{
            required: "Karencja jest wymagana",
            min: { value: 0, message: "Karencja musi być większa niż 0" },
          }}
        />
        <NumberInput
          label="WIBOR z umowy (%)"
          control={control}
          name="wiborRate"
          rules={{
            required: "WIBOR z umowy jest wymagany",
            min: { value: 0.01, message: "WIBOR musi być nieujemny" },
          }}
        />
        <DynamicFieldArray
          control={control}
          name="prepayments"
          label="Nadpłaty (wprowadź po jednej, format: Data, Kwota)"
          buttonLabel="Dodaj nadpłatę"
        />
        <DynamicFieldArray
          control={control}
          name="disbursements"
          label="Transze (wprowadź po jednej, format: Data, Kwota)"
          buttonLabel="Dodaj transzę"
        />
        <DynamicFieldArray
          control={control}
          name="holidayMonths"
          label="Wakacje kredytowe (wprowadź po jednej, format: Data)"
          buttonLabel="Dodaj wakacje kredytowe"
        />
        <SelectInput
          label="Typ rat"
          control={control}
          name="installmentType"
          options={[
            { value: "równe", label: "równe" },
            { value: "malejące", label: "Malejące" },
          ]}
          rules={{ required: "Typ rat jest wymagany" }}
        />
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
        Oblicz
      </button>
    </form>
  );
};

export default ParametersForm;
