import React, { useState, useContext } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './BikeItem.css';

const BikeItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const cancelReserveBike = async (reservationId, userId) => {
    await sendRequest(`http://localhost:5000/api/bikes/${props.id}/cancel_reserve`,
      'PATCH',
      JSON.stringify({reservationId, userId}),
      { 
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + auth.token
      });
  }

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      if (!!props.reservations && props.reservations.length > 0) {
        // const cancelPromises = props.reservations.map(reservation => setTimeout(async () => await cancelReserveBike(reservation.id, reservation.userId), 1000));
        // await Promise.all(cancelPromises);
        props.reservations.forEach((reservation, index) => {
          setTimeout(() => cancelReserveBike(reservation.id, reservation.userId), index * 1000);
        });
        setTimeout(async () => {
          await sendRequest(
            `http://localhost:5000/api/bikes/${props.id}`,
            'DELETE',
            null,
            {
              Authorization: 'Bearer ' + auth.token
            }
          );
          props.onDelete(props.id);
        }, props.reservations.length * 1000 + 1000);
      } else {
          await sendRequest(
            `http://localhost:5000/api/bikes/${props.id}`,
            'DELETE',
            null,
            {
              Authorization: 'Bearer ' + auth.token
            }
          );
          props.onDelete(props.id);
      }
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="bike-item__modal-content"
        footerClass="bike-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?"
        footerClass="bike-item__modal-actions"
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
          Do you want to proceed and delete this bike? Please note that it
          can't be undone thereafter.
        </p>
      </Modal>
      <li className="bike-item">
        <Card className="bike-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="bike-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="bike-item__info">
            <h2>{props.model + ' - ' + props.color + ' - ' + props.address}</h2>
            {props.rating && <h3>Rating: {props.rating}</h3>}
          </div>
          {!props.reservee && !props.availableBikes &&
            <div className="bike-item__available">
              {props.isAvailable ?
                <span className="available-bike">Available</span> :
                <span className="unavailable-bike">Not Available</span>
              }
            </div>
          }
          {props.reservee && !!props.reservations && !!props.reservations.length && props.reservations.map((reservation, index)=> (
            <div key={index + 1} className="bike-item__reservations">
              <div className="bike-item__reservation-user">user: {reservation.userEmail}</div>
              <div>
                <div>period(s):</div>
                <div>
                    {reservation.from.substr(0, reservation.from.length - 8)} - {reservation.to.substr(0, reservation.to.length - 8)}
                </div>
              </div>
            </div>
          ))}
          {!props.reservee &&
            <div className="bike-item__actions">
              <Button inverse onClick={openMapHandler}>
                VIEW ON MAP
              </Button>
              <Button to={`/bikes/${props.id}`}>{props.availableBikes ? 'RESERVE' : 'EDIT'}</Button>
              {!props.availableBikes && <Button danger onClick={showDeleteWarningHandler}>DELETE</Button>}
            </div>
          }
        </Card>
      </li>
    </React.Fragment>
  );
};

export default BikeItem;
