import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import BikeItem from './BikeItem';
import Button from '../../shared/components/FormElements/Button';
import './BikeList.css';

const BikeList = props => {
  if (props.items.length === 0) {
    return (
      <div className="bike-list center">
        <Card>
          <h2>No bikes found. Maybe create one?</h2>
          <Button to="/bikes/new">Create Bike</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="bike-list">
      {props.items.map(bike => (
        <BikeItem
          key={bike.id}
          id={bike.id}
          image={bike.image}
          model={bike.model}
          color={bike.color}
          address={bike.address}
          rating={bike.rating}
          isAvailable={bike.isAvailable}
          coordinates={bike.location}
          onDelete={props.onDeleteBike}
          reservee={props.reservee}
          availableBikes={props.availableBikes}
          reservations={bike.reservations}
        />
      ))}
    </ul>
  );
};

export default BikeList;
