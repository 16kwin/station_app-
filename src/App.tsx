// App.tsx — ПОЛНЫЙ ФАЙЛ (исправлен LockScreen: убран fixed, добавлен overflow)
import { useEffect, useState } from 'react';
import FullScreenPreloader from './components/commonComponents/FullScreenPreloader';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import PrivateRoute from './services/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './components/loginPage/LoginPage';
import MainPage from './components/mainPage/MainPage';
import StationsPage from './components/StationsPage/StationsPage';
import ReferencesPage from './components/ReferencesPage/ReferencesPage';
import NomenclaturePage from './components/ReferencesPage/NomenclaturePage/NomenclaturePage';
import NomenclatureCreatePage from './components/ReferencesPage/NomenclaturePage/NomenclatureCreatePage';
import AccountingGroupsPage from './components/ReferencesPage/AccountingGroupsPage/AccountingGroupsPage';
import NomenclatureGroupsPage from './components/ReferencesPage/NomenclatureGroupsPage/NomenclatureGroupsPage';
import NomenclatureTypesPage from './components/ReferencesPage/NomenclatureTypesPage/NomenclatureTypesPage';
import AttributeTypesPage from './components/ReferencesPage/AttributeTypesPage/AttributeTypesPage';
import UnitsPage from './components/ReferencesPage/UnitsPage/UnitsPage';
import BrandsPage from './components/ReferencesPage/BrandsPage/BrandsPage';
import ModelsPage from './components/ReferencesPage/ModelsPage/ModelsPage';
import CountriesPage from './components/ReferencesPage/CountriesPage/CountriesPage';
import ManufacturersPage from './components/ReferencesPage/ManufacturersPage/ManufacturersPage';
import SuppliersPage from './components/ReferencesPage/SuppliersPage/SuppliersPage';
import SupplierCreatePage from './components/ReferencesPage/SuppliersPage/SupplierCreatePage';
import TemplatesPage from './components/ReferencesPage/TemplatesPage/TemplatesPage';
import HoldingsPage from './components/ReferencesPage/HoldingsPage/HoldingsPage';
import EnterprisesPage from './components/ReferencesPage/EnterprisesPage/EnterprisesPage';
import WorkshopsPage from './components/ReferencesPage/WorkshopsPage/WorkshopsPage';
import SectionsPage from './components/ReferencesPage/SectionsPage/SectionsPage';
import StationTypesPage from './components/ReferencesPage/StationTypesPage/StationTypesPage';
import StationManufacturersPage from './components/ReferencesPage/StationManufacturersPage/StationManufacturersPage';
import StationModelsPage from './components/ReferencesPage/StationModelsPage/StationModelsPage';
import StationModelCreatePage from './components/ReferencesPage/StationModelsPage/StationModelCreatePage';
import StationConfigurationsPage from './components/ReferencesPage/StationConfigurationsPage/StationConfigurationsPage';
import StationConfigurationCreatePage from './components/ReferencesPage/StationConfigurationsPage/StationConfigurationCreatePage';
import StationsCrudPage from './components/ReferencesPage/StationsCrudPage/StationsCrudPage';
import StationCreatePage from './components/ReferencesPage/StationsCrudPage/StationCreatePage';
import DocumentsPage from './components/DocumentsPage/DocumentsPage';
import ReportsPage from './components/ReportsPage/ReportsPage';
import AnalyticsPage from './components/AnalyticsPage/AnalyticsPage';
import OrdersPage from './components/AnalyticsPage/OrdersPage';
import OrderCreatePage from './components/AnalyticsPage/OrderCreatePage';
import TkpPage from './components/AnalyticsPage/TkpPage';
import TkpViewPage from './components/AnalyticsPage/TkpViewPage';
import SettingsPage from './components/SettingsPage/SettingsPage';
import AccountPage from './components/AccountPage/AccountPage';
import SchablonPage from './components/DocumentsPage/Schablon/SchablonPage';
import AxiosService from './services/AxiosService';
import { setNavigator } from './services/navigate';
import { TabProvider } from './context/TabContext';
import { AuthProvider, useAuth } from './services/AuthContext';
import LockScreen from './components/LockScreen/LockScreen';
import InactivityWarning from './components/InactivityWarning/InactivityWarning';
import { useInactivityLock } from './components/hooks/useInactivityLock';
import AnimatedGradientBackground from './effects/AnimatedGradientBackground';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent = () => {
  const [needPreloader, setNeedPreloader] = useState(true);
  const navigate = useNavigate();
  const { isAuth, isLoading, isLocked, setLocked } = useAuth();
  const { showWarning, setShowWarning } = useInactivityLock();

  useEffect(() => { setNavigator(navigate); }, [navigate]);

  useEffect(() => {
    AxiosService.get('/csrf')
      .then((res) => { const csrfToken = res.data.token; AxiosService.defaults.headers['X-XSRF-TOKEN'] = csrfToken; })
      .catch((e) => { console.error('Ошибка получения CSRF', e); })
      .finally(() => { setNeedPreloader(false); });
  }, []);

  const handleUnlock = () => { setLocked(false); };

  if (needPreloader || isLoading) return <FullScreenPreloader />;

  return (
    <div className="relative min-h-screen">
      <AnimatedGradientBackground />
      <AnimatePresence mode="wait">
        {isAuth && isLocked ? (
          <motion.div key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] overflow-auto">
            <LockScreen onUnlock={handleUnlock} />
          </motion.div>
        ) : isAuth ? (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Routes>
              <Route path="/login" element={<Navigate to="/main" replace />} />
              <Route path="/" element={<PrivateRoute><TabProvider><MainLayout /></TabProvider></PrivateRoute>}>
                <Route index element={<MainPage />} />
                <Route path="main" element={<MainPage />} />
                <Route path="stations" element={<StationsPage />} />
                <Route path="references" element={<ReferencesPage />} />
                <Route path="references/holdings" element={<HoldingsPage />} />
                <Route path="references/nomenclature" element={<NomenclaturePage />} />
                <Route path="references/nomenclature/create/:uid/:code" element={<NomenclatureCreatePage />} />
                <Route path="references/nomenclature/edit/:uid/:code" element={<NomenclatureCreatePage />} />
                <Route path="references/accounting-groups" element={<AccountingGroupsPage />} />
                <Route path="references/nomenclature-groups" element={<NomenclatureGroupsPage />} />
                <Route path="references/nomenclature-types" element={<NomenclatureTypesPage />} />
                <Route path="references/attribute-types" element={<AttributeTypesPage />} />
                <Route path="references/units" element={<UnitsPage />} />
                <Route path="references/brands" element={<BrandsPage />} />
                <Route path="references/models" element={<ModelsPage />} />
                <Route path="references/countries" element={<CountriesPage />} />
                <Route path="references/manufacturers" element={<ManufacturersPage />} />
                <Route path="references/suppliers" element={<SuppliersPage />} />
                <Route path="references/suppliers/create/:uid/:code" element={<SupplierCreatePage />} />
                <Route path="references/suppliers/edit/:uid" element={<SupplierCreatePage />} />
                <Route path="references/templates" element={<TemplatesPage />} />
                <Route path="references/enterprises" element={<EnterprisesPage />} />
                <Route path="references/workshops" element={<WorkshopsPage />} />
                <Route path="references/sections" element={<SectionsPage />} />
                <Route path="references/station-types" element={<StationTypesPage />} />
                <Route path="references/station-manufacturers" element={<StationManufacturersPage />} />
                <Route path="references/station-models" element={<StationModelsPage />} />
                <Route path="references/station-models/create/:uid" element={<StationModelCreatePage />} />
                <Route path="references/station-models/edit/:uid" element={<StationModelCreatePage />} />
                <Route path="references/station-configurations" element={<StationConfigurationsPage />} />
                <Route path="references/station-configurations/create/:uid" element={<StationConfigurationCreatePage />} />
                <Route path="references/station-configurations/edit/:uid" element={<StationConfigurationCreatePage />} />
                <Route path="references/stations" element={<StationsCrudPage />} />
                <Route path="references/stations/create/:uid" element={<StationCreatePage />} />
                <Route path="references/stations/edit/:uid" element={<StationCreatePage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="documents/schablon/:uid" element={<SchablonPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/create/:uid" element={<OrderCreatePage />} />
                <Route path="orders/:uid" element={<OrderCreatePage />} />
                <Route path="tkp" element={<TkpPage />} />
                <Route path="tkp/:uid" element={<TkpViewPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="account" element={<AccountPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
            <InactivityWarning show={showWarning} onClose={() => setShowWarning(false)} />
          </motion.div>
        ) : (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;