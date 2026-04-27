import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home/home'
import Signup from './pages/Auth/signup'
import Login from './pages/Auth/login'
import CustomerDashboard from './pages/Customer/Dashboard/dashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import DriverDashboard from './pages/Driver/DashBoard/dashboard';
import PostLoad from './pages/Customer/postLoad/postLoad';
import CustomerProfile from './pages/Customer/profile/profile';
import DriverProfile from './pages/Driver/profile/profile';
import { listenNotifications } from './firebase/notificationListener';
import { ToastProvider } from './components/Toast/Toast';
import Navbar from './components/Navbar/Navbar';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';

import TrackRide from './pages/TrackRide';
import 'leaflet/dist/leaflet.css';
import './App.css'
import { useEffect } from 'react';
import axios from "axios";

axios.defaults.withCredentials = true;



function AppContent() {
  useEffect(() => {
  listenNotifications();
}, []);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-content">
        <Routes>

          {/* public Routes */}
          <Route path='/' element={<Home/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/login' element={<Login/>} />
          <Route path="/track/:rideId" element={<TrackRide />} />



          {/* customer Routes  */}
          
            <Route element={<ProtectedRoute allowedRole="customer" />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard/>}/>
              <Route path="/post-ride" element={<PostLoad/>}/>
              <Route path="/customer/profile" element={<CustomerProfile />} />

              {/* <Route path="/customer/map" element={<CustomerMap />} /> */}
            </Route>

            {/* Driver Routes */}
          
            <Route element={<ProtectedRoute allowedRole="driver" />}>
              <Route path="/driver/profile" element={<DriverProfile />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            
            {/* Map Route */}
          {/* <Route path="/map" element={<Map />} /> */}
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
