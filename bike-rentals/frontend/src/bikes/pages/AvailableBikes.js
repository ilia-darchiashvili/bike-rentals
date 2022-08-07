import React, { useEffect, useState } from 'react';
import DateTimePicker from 'react-datetime-picker';

import BikeList from '../components/BikeList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const AvailableBikes = () => {
  const [loadedBikes, setLoadedBikes] = useState();
  const [initialBikes, setInitialBikes] = useState();
  const [filterDate, setFilterDate] = useState();
  const [filterModel, setFilterModel] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);


  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/bikes`
        );
        const availableBikes = responseData.bikes.filter(bike => bike.isAvailable);
        setLoadedBikes(availableBikes);
        setInitialBikes(availableBikes);
      } catch (err) {}
    };
    fetchBikes();
  }, [sendRequest]);

  const bikeDeletedHandler = deletedBikeId => {
    setLoadedBikes(prevBikes =>
      prevBikes.filter(bike => bike.id !== deletedBikeId)
    );
  };

  const showFilteredBikes = () => {
    let filteredBikes = loadedBikes.filter(bike => {
        if (!filterDate || (!!bike.reservations && bike.reservations.length === 0)) {
            return bike;
        } else {
            let bikeAvailableOuter = bike.reservations.every(reservation => {
                let fromDate = new Date(new Date(reservation.from).getTime() + new Date(reservation.from).getTimezoneOffset()*60*1000);
                let toDate = new Date(new Date(reservation.to).getTime() + new Date(reservation.to).getTimezoneOffset()*60*1000);
                
                if (filterDate < fromDate) {
                    return true;
                }

                if (filterDate >= toDate) {
                    return true;
                }

                return false;
            });

            let bikeAvailableInner = bike.reservations.some(reservation => {
                let fromDate = new Date(new Date(reservation.from).getTime() + new Date(reservation.from).getTimezoneOffset()*60*1000);
                let toDate = new Date(new Date(reservation.to).getTime() + new Date(reservation.to).getTimezoneOffset()*60*1000);

                if (filterDate >= fromDate && filterDate < toDate) {
                    return false;
                }

                return true;
            });

            if (bikeAvailableOuter || bikeAvailableInner) {
                return bike;
            }
        }
    });

    if (filterModel) {
        filteredBikes = filteredBikes.filter(bike => bike.model.indexOf(filterModel) !== -1);
    }
    if (filterColor) {
        filteredBikes = filteredBikes.filter(bike => bike.color.indexOf(filterColor) !== -1);
    }
    if (filterLocation) {
        filteredBikes = filteredBikes.filter(bike => bike.address.indexOf(filterLocation) !== -1);
    }
    if (filterRating) {
        filteredBikes = filteredBikes.filter(bike => bike.rating == filterRating);
    }
    setLoadedBikes(filteredBikes);
  }

  const validateShow = () => {
    if (!filterDate && !filterModel && !filterColor && !filterLocation && !filterRating) {
        return true;
    }
    
    if (filterDate < currentDate) {
        return true;
    }
    
    return false;
  }

  const clearFilters = () => {
    setFilterDate(undefined);
    setFilterModel('');
    setFilterColor('');
    setFilterLocation('');
    setLoadedBikes(initialBikes);
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedBikes && (
        <div className="bike-form_filter-date">
            <div className="bike-form_filter-wrapper">
                <label className="bike-form_filter-label">Date</label>
                <DateTimePicker onChange={setFilterDate} value={filterDate} clockClassName="hide-clock" />
            </div>
            <div className="bike-form_filter-wrapper">
                <label className="bike-form_filter-label">Model</label>
                <input
                    id="model"
                    type="text"
                    value={filterModel}
                    onChange={event => setFilterModel(event.target.value)}
                />
            </div>
            <div className="bike-form_filter-wrapper">
                <label className="bike-form_filter-label">Color</label>
                <input
                    id="color"
                    type="text"
                    value={filterColor}
                    onChange={event => setFilterColor(event.target.value)}
                />
            </div>
            <div className="bike-form_filter-wrapper">
                <label className="bike-form_filter-label">Location</label>
                <input
                    id="location"
                    type="text"
                    value={filterLocation}
                    onChange={event => setFilterLocation(event.target.value)}
                />
            </div>
            <div className="bike-form_filter-wrapper">
                <label className="bike-form_filter-label">Rating</label>
                <input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={filterRating}
                    onChange={event => setFilterRating(event.target.value)}
                />
            </div>
            <Button onClick={() => showFilteredBikes()} disabled={validateShow()}>
                SHOW
            </Button>
            <Button inverse onClick={() => clearFilters()}>
                CLEAR
            </Button>
            <BikeList items={loadedBikes} onDeleteBike={bikeDeletedHandler} availableBikes={true} />
        </div>
      )}
    </React.Fragment>
  );
};

export default AvailableBikes;
