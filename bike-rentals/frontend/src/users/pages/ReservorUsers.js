import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const ReservorUsers = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          'http://localhost:5000/api/users'
        );
        const reservorUsers = responseData.users.filter(user => !!user.reservedBikes && !!user.reservedBikes.length);
        
        setLoadedUsers(reservorUsers);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest]);

  const userDeletedHandler = deletedUserId => {
    setLoadedUsers(prevUsers =>
      prevUsers.filter(user => user.id !== deletedUserId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} onDeleteUser={userDeletedHandler} reservor={true} />}
    </React.Fragment>
  );
};

export default ReservorUsers;
