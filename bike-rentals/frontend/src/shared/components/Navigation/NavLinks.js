import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useHttpClient } from '../../hooks/http-hook'
import LoadingSpinner from '../../components/UIElements/LoadingSpinner';
import ErrorModal from '../../components/UIElements/ErrorModal';
import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = () => {
  const auth = useContext(AuthContext);
  const [loadedUser, setLoadedUser] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.userId) {
        const responseData = await sendRequest(
          `http://localhost:5000/api/users/${auth.userId}`
        );
        setLoadedUser(responseData.user);
      }
    }
    fetchUser();
  }, [sendRequest, auth]);
  

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {auth.isLoggedIn && loadedUser && loadedUser.isManager && (
          <ul className= "nav-links">
            <li className={location.pathname === '/' ? "active-nav-link" : ""}>
              <NavLink to="/all_users">
                ALL USERS
              </NavLink>
            </li>
            <li>
              <NavLink to="/users/new">
                ADD USER
              </NavLink>
            </li>
            <li>
              <NavLink to="/all_bikes">
                ALL BIKES
              </NavLink>
            </li>
            <li>
              <NavLink to="/bikes/new">
                ADD BIKE
              </NavLink>
            </li>
            <li>
              <NavLink to="/reservor_users">
                RESERVOR USERS
              </NavLink>
            </li>
            <li>
              <NavLink to="/reservee_bikes">
                RESERVEE BIKES
              </NavLink>
            </li>
            <li>
              <button onClick={auth.logout}>LOGOUT</button>
            </li>
          </ul>
        )}
        {auth.isLoggedIn && loadedUser && !loadedUser.isManager && (
          <ul className="nav-links">
            <li className={location.pathname === '/' ? "active-nav-link" : ""}>
              <NavLink to="/available_bikes">
                AVAILABLE BIKES
              </NavLink>
            </li>
            <li>
              <button onClick={auth.logout}>LOGOUT</button>
            </li>
          </ul>
        )}
    </>
  )
};

export default NavLinks;
