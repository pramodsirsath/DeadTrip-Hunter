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

import TrackRide from './pages/TrackRide';
import 'leaflet/dist/leaflet.css';
import './App.css'

function App() {
  

  return (
    <>
    <BrowserRouter>
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
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
          </Route>
          
          
          {/* Map Route */}
        {/* <Route path="/map" element={<Map />} /> */}
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
