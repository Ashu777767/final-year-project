// src/context/LocationContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const LocationContext = createContext();

export const useLocation = () => React.useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState({}); // {key: profileObj}

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("co2_saved_profiles");
    if (stored) {
      try {
        setSavedProfiles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved profiles", e);
      }
    }
    const loc = localStorage.getItem("co2_location");
    if (loc) {
      try {
        setLocation(JSON.parse(loc));
      } catch (e) {
        console.error("Failed to parse saved location", e);
      }
    }
  }, []);

  // Persist location changes
  useEffect(() => {
    if (location) {
      localStorage.setItem("co2_location", JSON.stringify(location));
    }
  }, [location]);

  // Persist saved profiles changes
  useEffect(() => {
    localStorage.setItem("co2_saved_profiles", JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  const saveProfile = (key, profile) => {
    setSavedProfiles((prev) => ({ ...prev, [key]: profile }));
  };

  const loadProfile = (key) => {
    const profile = savedProfiles[key];
    if (profile) {
      setLocation(profile);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        savedProfiles,
        saveProfile,
        loadProfile,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
