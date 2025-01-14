import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Layout from '@/components/app-layout';
import {AuthProvider} from '@/components/auth_context';
import ForgotPassword from '@/components/forgot-password';
import ResetPassword from '@/components/reset-password';



const LayoutWithChildren = () => {
    return (
        <Layout>
            <h1>Bus Tracker</h1>
        </Layout>
    );
}


const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LayoutWithChildren />} />
                    <Route path="/verify" element={<LayoutWithChildren />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
