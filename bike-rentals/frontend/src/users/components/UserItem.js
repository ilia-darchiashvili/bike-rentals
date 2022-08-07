import React, { useState, useContext } from 'react';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './UserItem.css';

const UserItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `http://localhost:5000/api/users/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  let groupedReservations = []
  if (!!props.reservedBikes && props.reservedBikes.length > 0) {
    groupedReservations = props.reservedBikes.reduce((accum, current) => {
      if (accum.some(element => element.bike === current.model)) {
        accum.some((element, index) => {
          if (element.bike === current.model) {
            return accum[index].reservations = current.reservations.filter(reser => reser.userId == props.id)
          }
        })
      } else {
        accum.push({bike: current.model, reservations: current.reservations.filter(reser => reser.userId == props.id)})
      }
      return accum;
    }, []);
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="user-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>
          Do you want to proceed and delete this user? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      <li className="user-item">
        <Card className="user-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="user-item__image">
            <Avatar image={`http://localhost:5000/${props.image}`} alt={props.name} />
          </div>
          <div className="user-item__info">
            <h2>{props.name}</h2>
            <h3>{props.isManager ? "Manager" : "User"}</h3>
          </div>
          {props.reservor && !!groupedReservations && !!groupedReservations.length && groupedReservations.map((reservation, index)=> (
            <div key={index + 1} className="user-item__bikes">
              <div className="user-item__bike">bike: {reservation.bike}</div>
              <div>
                <div>period(s):</div>
                <div>
                  {!!reservation.reservations && !!reservation.reservations.length && reservation.reservations.map((reserve, index) => (
                    <React.Fragment key={index + 1}>
                      {reserve.userId === props.id && <div>{reserve.from.substr(0, reserve.from.length - 8)} - {reserve.to.substr(0, reserve.to.length - 8)}</div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {!props.reservor && 
            <div className="user-item__actions">
              <Button to={`/${props.id}`}>EDIT</Button>
              <Button danger onClick={showDeleteWarningHandler}>DELETE</Button>
            </div>
          }
        </Card>
      </li>
    </>
  );
};

export default UserItem;
