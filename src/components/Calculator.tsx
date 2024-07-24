import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { fetchWibor } from '../store/actions/wiborActions';
import { AppDispatch, AppState } from '../store/store';
import ParametersForm from './ParametersForm';
import Spinner from './shared/spinner/Spinner';


const Calculator: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const loading = useSelector((state: AppState) => state.wibor.loading);

  useEffect(() => {
    dispatch(fetchWibor());
  }, [dispatch]);


  if (loading) {
    return <Spinner />;
  }

  return (
    <motion.div
      style={{ marginTop: '100px' }}
      className="p-6 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold mb-4">Kalkulator Korzyści</h1>
      <ParametersForm  />
    </motion.div>
  );
};

export default Calculator;
