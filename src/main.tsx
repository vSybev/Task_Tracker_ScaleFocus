import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './app/store';
import { AppThemeProvider } from './app/theme/AppThemeProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <AppThemeProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AppThemeProvider>
        </Provider>
    </React.StrictMode>,
);
