// context/VolunteerContext.js
import React, { createContext, useState } from 'react';

export const VolunteerDataContext = createContext();

const VolunteerContext = ({ children }) => {
  const [volunteer, setVolunteer] = useState({
    firstname: '',
    lastname: '',
    email: '',
    address: ''
  });

  return (
    <VolunteerDataContext.Provider value={{ volunteer, setVolunteer }}>
      {children}
    </VolunteerDataContext.Provider>
  );
};

export default VolunteerContext;
