import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './UserForm.css';


const NewUser = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const navigate = useNavigate();

  const [formState, inputHandler] = useForm(
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
      },
      image: {
        value: null,
        isValid: false
      }
    },
    false
  );

  const userNewSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('email', formState.inputs.email.value);
      formData.append('name', formState.inputs.name.value);
      formData.append('password', formState.inputs.password.value);
      formData.append('image', formState.inputs.image.value);
      formData.append('isManager', formState.inputs.isManager.checked);
      await sendRequest(
        `http://localhost:5000/api/users`,
        'POST',
        formData,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      navigate('/all_users');
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
        <form className="user-form" onSubmit={userNewSubmitHandler}>
            {isLoading && <LoadingSpinner asOverlay />}
            <Input
                id="name"
                element="input"
                type="text"
                label="Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid name."
                onInput={inputHandler}
            />
            <ImageUpload
                center
                id="image"
                onInput={inputHandler}
            />
            <Input
                id="email"
                element="input"
                type="email"
                label="Email"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid email address."
                onInput={inputHandler}
            />
            <Input
                element="input"
                id="password"
                type="password"
                label="Password"
                validators={[VALIDATOR_MINLENGTH(6)]}
                errorText="Please enter a valid password, at least 6 characters."
                onInput={inputHandler}
            />
            <Input
                element="input"
                id="isManager"
                type="checkbox"
                label="Manager"
                onInput={inputHandler}
                validators={[]}
                initialValid={true}
            />
            <Button type="submit" disabled={!formState.isValid}>
                ADD USER
            </Button>
        </form>
    </React.Fragment>
  );
};

export default NewUser;
