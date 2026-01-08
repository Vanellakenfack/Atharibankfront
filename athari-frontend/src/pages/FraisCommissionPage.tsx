import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FraisCommissionList from '../components/frais/FraisCommissionList';
import FraisCommissionForm from '../components/frais/FraisCommissionForm';
import FraisCommissionDetail from '../components/frais/FraisCommissionDetail';
import Layout from '../components/layout/Layout';

const FraisCommissionPage: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<FraisCommissionList />} />
        <Route path="nouveau" element={<FraisCommissionForm />} />
        <Route path="edit/:id" element={<FraisCommissionForm isEdit />} />
        <Route path="detail/:id" element={<FraisCommissionDetail />} />
        <Route path="*" element={<FraisCommissionList />} />
      </Routes>
    </Layout>
  );
};

export default FraisCommissionPage;
