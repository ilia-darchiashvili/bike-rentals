import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
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


const UpdateUser = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState();
  const userId = useParams().userId;
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
    const fetchUser = async () => {
      if (userId) {
        try {
          const responseData = await sendRequest(
            `http://localhost:5000/api/users/${userId}`
          );
          setLoadedUser(responseData.user);
          setFormData(
            {
              name: {
                value: responseData.user.name,
                isValid: true
              },
              email: {
                value: responseData.user.email,
                isValid: true
              },
              password: {
                value: responseData.user.password,
                isValid: true
              },
              isManager: {
                value: responseData.user.isManager,
                isValid: true
              }
            },
            true
          );
        } catch (err) {}
      }
    };
    fetchUser();
  }, [sendRequest, userId, setFormData]);

  const userUpdateSubmitHandler = async event => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('email', formState.inputs.email.value);
      formData.append('name', formState.inputs.name.value);
      formData.append('password', formState.inputs.password.value);
      formData.append('isManager', formState.inputs.isManager.checked);
      formState.inputs.image?.value && formData.append('image', formState.inputs.image.value);
      await sendRequest(
        `http://localhost:5000/api/users/${userId}`,
        'PATCH',
        formData,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      navigate('/all_users');
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedUser && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find user!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedUser && (
        <form className="user-form" onSubmit={userUpdateSubmitHandler}>
          <Input
            id="name"
            element="input"
            type="text"
            label="Name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid name."
            onInput={inputHandler}
            initialValue={loadedUser.name}
            initialValid={true}
          />
          <ImageUpload
            center
            id="image"
            onInput={inputHandler}
            previewUrl={'http://localhost:5000/uploads/images/' + loadedUser.image.substr(loadedUser.image.lastIndexOf('\\') + 1)}
          />
          <Input
            id="email"
            element="input"
            type="email"
            label="Email"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
            initialValue={loadedUser.email}
            initialValid={true}
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
            initialValue={loadedUser.isManager}
            initialValid={true}
          />
          <Button inverse onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE USER
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdateUser;
