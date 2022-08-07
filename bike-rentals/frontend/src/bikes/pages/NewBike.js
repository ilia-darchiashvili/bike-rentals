import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './BikeForm.scss';

const NewBike = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      model: {
        value: '',
        isValid: false
      },
      color: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      rating: {
        value: null,
        isValid: false
      },
      image: {
        value: null,
        isValid: false
      },
      isAvailable: {
        value: false,
        isValid: false
      }
    },
    false
  );

  const navigate = useNavigate();

  const bikeSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('model', formState.inputs.model.value);
      formData.append('color', formState.inputs.color.value);
      formData.append('address', formState.inputs.address.value);
      formData.append('rating', +formState.inputs.rating.value);
      formData.append('image', formState.inputs.image.value);
      formData.append('isAvailable', formState.inputs.isAvailable.checked);
      await sendRequest('http://localhost:5000/api/bikes', 'POST', formData, {
        Authorization: 'Bearer ' + auth.token
      });
      navigate('/all_bikes');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="bike-form" onSubmit={bikeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="model"
          element="input"
          type="text"
          label="Model"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid model."
          onInput={inputHandler}
        />
        <Input
          id="color"
          element="input"
          type="text"
          label="Color"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid color."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Location"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid location."
          onInput={inputHandler}
        />
        <Input
          id="rating"
          element="input"
          type="number"
          min="1"
          max="5"
          label="Rating (min: 1, max: 5)"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid color."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image."
        />
        <Input
            element="input"
            id="isAvailable"
            type="checkbox"
            label="Available"
            onInput={inputHandler}
            validators={[]}
            initialValid={true}
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD BIKE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewBike;
