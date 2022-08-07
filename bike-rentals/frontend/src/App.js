import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes
} from 'react-router-dom';

import Users from './users/pages/Users';
import NewBike from './bikes/pages/NewBike';
import Bikes from './bikes/pages/Bikes';
import AvailableBikes from './bikes/pages/AvailableBikes';
import UpdateBike from './bikes/pages/UpdateBike';
import UpdateUser from './users/pages/UpdateUser';
import NewUser from './users/pages/NewUser';
import ReservorUsers from './users/pages/ReservorUsers';
import ReserveeBikes from './bikes/pages/ReserveeBikes';
import Auth from './users/pages/Auth';
import MainNavigation from './shared/components/Navigation/MainNavigation';
import { AuthContext } from './shared/context/auth-context';
import { useAuth } from './shared/hooks/auth-hook';

const App = () => {
  const { token, login, logout, userId, isManager } = useAuth();

  const loggedOutRoutes = (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/all_users" element={<Navigate to="/auth" />} />
      <Route path="/users/new" element={<Navigate to="/auth" />} />
      <Route path="/all_bikes" element={<Navigate to="/auth" />} />
      <Route path="/bikes/new" element={<Navigate to="/auth" />} />
      <Route path="/bikes/:bikeId" element={<Navigate to="/auth" />} />
      <Route path="/:userId" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  )
  const loggedInRoutes = (
    <Routes>
      <Route path="/" element={isManager ? <Users /> : <AvailableBikes />} />
      <Route path="/all_users" element={<Users />} />
      <Route path="/users/new" element={<NewUser />} />
      <Route path="/all_bikes" element={<Bikes />} />
      <Route path="/available_bikes" element={<AvailableBikes />} />
      <Route path="/bikes/new" element={<NewBike />} />
      <Route path="/bikes/:bikeId" element={<UpdateBike />} />
      <Route path="/:userId" element={<UpdateUser />} />
      <Route path="/reservor_users" element={<ReservorUsers />} />
      <Route path="/reservee_bikes" element={<ReserveeBikes />} />
      <Route path="/auth" element={<Navigate to="/" />} />
    </Routes>
  )

  let routes;
  if (token) {
    routes = loggedInRoutes;
  } else {
    routes = loggedOutRoutes;
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        isManager: isManager,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
