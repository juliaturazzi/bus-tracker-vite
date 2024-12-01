import React from 'react';
import Layout from '@/components/app-layout';
import { AuthProvider } from '@/components/auth_context';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Layout>
                <h1>Bus Tracker</h1>
            </Layout>
        </AuthProvider>
    );
};

export default App;
