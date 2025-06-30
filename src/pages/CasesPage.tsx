import React, { useState, useEffect } from 'react';
import CasesList from '../components/cases/CasesList';
import { Case } from '../types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Case[]>(`${API_URL}/cases`);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return <CasesList cases={cases} loading={loading} onRefresh={fetchCases} />;
};

export default CasesPage;