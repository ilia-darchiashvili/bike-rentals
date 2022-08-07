import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DateTimePicker from 'react-datetime-picker';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './BikeForm.scss';

const UpdateBike = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedBike, setLoadedBike] = useState();
  const [fromValue, setFromValue] = useState();
  const [toValue, setToValue] = useState();
  const [reservations, setReservations] = useState([]);
  const bikeId = useParams().bikeId;
  const currentDate = new Date();
  const navigate = useNavigate();

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: {
        value: '',
        isValid: false
      },
      email: {
        value: '',
        isValid: false
      },
      password: {
        value: '',
        isValid: false
      },
      isManager: {
        value: false,
        isValid: false
      }
    },
    false
  );

  useEffect(() => {
    const fetchBike = async () => {
      if (bikeId) {
        try {
          const responseData = await sendRequest(
            `http://localhost:5000/api/bikes/${bikeId}`
          );
          setLoadedBike(responseData.bike);
          setFormData(
            {
              model: {
                value: responseData.bike.name,
                isValid: true
              },
              color: {
                value: responseData.bike.name,
                isValid: true
              },
              address: {
                value: responseData.bike.name,
                isValid: true
              },
              color: {
                value: responseData.bike.name,
                isValid: true
              },
              isAvailable: {
                value: responseData.bike.isAvailable,
                isValid: true
              }
            },
            true
          );
        } catch (err) {}
      }
    };
    fetchBike();
  }, [sendRequest, bikeId, setFormData]);

  const bikeUpdateSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('model', formState.inputs.model.value);
      formData.append('color', formState.inputs.color.value);
      formData.append('address', formState.inputs.address.value);
      formData.append('rating', +formState.inputs.rating.value);
      formState.inputs.image?.value && formData.append('image', formState.inputs.image.value);
      formData.append('isAvailable', formState.inputs.isAvailable.checked);
      await sendRequest(`http://localhost:5000/api/bikes/${bikeId}`, 'PATCH', formData, {
        Authorization: 'Bearer ' + auth.token
      });
      navigate('/all_bikes');
    } catch (err) {}
  };

  useEffect(() => {
    !!loadedBike && !!loadedBike.reservations && !!loadedBike.reservations.length && setReservations(loadedBike.reservations)
  }, [loadedBike]);

  const reserveBike = async () => {
    const response = await sendRequest(`http://localhost:5000/api/bikes/${bikeId}/reserve`,
    'PATCH',
    JSON.stringify({
      from: new Date(fromValue.getTime() - fromValue.getTimezoneOffset()*60*1000),
      to: new Date(toValue.getTime() - fromValue.getTimezoneOffset()*60*1000),
      userId: auth.userId
    }),
    { 
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + auth.token
    });
    setReservations(response.reservations);
  }

  const cancelReserveBike = async (reservationId) => {
    const response = await sendRequest(`http://localhost:5000/api/bikes/${bikeId}/cancel_reserve`,
    'PATCH',
    JSON.stringify({reservationId, userId: auth.userId}),
    { 
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + auth.token
    });
    setReservations(response.reservations);
  }

  const validateReservation = () => {
    if (!fromValue || !toValue) {
      return true;
    }

    if (fromValue < currentDate) {
      return true;
    }

    if (fromValue >= toValue) {
      return true;
    }

    if (!!reservations && !!reservations.length) {
      let intersection = reservations.some(reservation => {
        let fromDate = new Date(new Date(reservation.from).getTime() + new Date(reservation.from).getTimezoneOffset()*60*1000);
        let toDate = new Date(new Date(reservation.to).getTime() + new Date(reservation.to).getTimezoneOffset()*60*1000);
        if (fromValue >= fromDate && fromValue < toDate) {
          return true;
        }
        if (toValue > fromDate && toValue <= toDate) {
          return true;
        }
        if (fromValue < fromDate && toValue > toDate) {
          return true;
        }
      });
      return intersection;
    }

    return false;
  }


  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedBike && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find bike!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedBike && (
        <form className="bike-form" onSubmit={bikeUpdateSubmitHandler}>
          <Input
            id="model"
            element="input"
            type="text"
            label="Model"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid model."
            onInput={inputHandler}
            initialValue={loadedBike.model}
            initialValid={true}
            disabled={!auth.isManager}
          />
          <Input
            id="color"
            element="input"
            type="text"
            label="Color"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid color."
            onInput={inputHandler}
            initialValue={loadedBike.color}
            initialValid={true}
            disabled={!auth.isManager}
          />
          <Input
            id="address"
            element="input"
            label="Location"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid location."
            onInput={inputHandler}
            initialValue={loadedBike.address}
            initialValid={true}
            disabled={!auth.isManager}
          />
          <Input
            id="rating"
            element="input"
            type="number"
            min="1"
            max="5"
            label="Rating (min:1, max:5)"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid color."
            onInput={inputHandler}
            initialValue={loadedBike.rating}
            initialValid={true}
          />
          {auth.isManager && 
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              previewUrl={'http://localhost:5000/uploads/images/' + loadedBike.image.substr(loadedBike.image.lastIndexOf('\\') + 1)}
            />
          }
          <Input
              element="input"
              id="isAvailable"
              type="checkbox"
              label="Available"
              onInput={inputHandler}
              validators={[]}
              initialValue={loadedBike.isAvailable}
              initialValid={true}
              disabled={!auth.isManager}
          />
          <div>
            {!auth.isManager && !!reservations && !!reservations.length && reservations.filter(reservation => reservation.userId === auth.userId).map((userReservation, index) => (
              <div key={index + 1} className="bike-form_reservations">
                {/* <span>{(userReservation.from).toString()} - {(userReservation.to).toString()}</span> */}
                <div className="bike-form_dates-wrapper">
                  <DateTimePicker disabled={true} value={new Date(new Date(userReservation.from).getTime() + new Date(userReservation.from).getTimezoneOffset()*60*1000)} />
                    - 
                  <DateTimePicker disabled={true} value={new Date(new Date(userReservation.to).getTime() + new Date(userReservation.to).getTimezoneOffset()*60*1000)} />
                </div>
                <Button danger onClick={() => cancelReserveBike(userReservation._id)}>
                  CANCEL
                </Button>
              </div>
            ))}
          </div>
          {loadedBike.isAvailable && !auth.isManager &&
            <div className="bike-form_dates-wrapper">
              <DateTimePicker onChange={setFromValue} value={fromValue} />
              - 
              <DateTimePicker onChange={setToValue} value={toValue} />
            </div>
          }
          <Button inverse onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="submit" disabled={!formState.isValid}>
            {auth.isManager ? 'UPDATE BIKE' : 'RATE BIKE'}
          </Button>
          {loadedBike.isAvailable && !auth.isManager &&
            <Button onClick={() => reserveBike()} disabled={validateReservation()}>
              RESERVE BIKE
            </Button>
          }
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateBike;
