import React, { useEffect, useState } from 'react';

import BikeList from '../components/BikeList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Bikes = () => {
  const [loadedBikes, setLoadedBikes] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/bikes`
        );
        setLoadedBikes(responseData.bikes);
      } catch (err) {}
    };
    fetchBikes();
  }, [sendRequest]);

  const bikeDeletedHandler = deletedBikeId => {
    setLoadedBikes(prevBikes =>
      prevBikes.filter(bike => bike.id !== deletedBikeId)
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
      {!isLoading && loadedBikes && (
        <BikeList items={loadedBikes} onDeleteBike={bikeDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default Bikes;
