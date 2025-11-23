import { useState, useEffect } from 'react';
import type { Trip } from '../types/trip.types';
import { MOCK_PARTICIPANTS } from '../config/constants';

const INITIAL_TRIP: Trip = {
    title: "",
    startDate: "TBD",
    endDate: "TBD",
    participants: MOCK_PARTICIPANTS
};

export function useTrip() {
    const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);

    useEffect(() => {
        const saved = localStorage.getItem('travelApp_trip');
        if (saved) {
            setTrip({ ...JSON.parse(saved), participants: MOCK_PARTICIPANTS });
        }
    }, []);

    const saveTrip = (newTrip: Trip) => {
        const updated = { ...newTrip, participants: trip.participants };
        setTrip(updated);
        localStorage.setItem('travelApp_trip', JSON.stringify(updated));
    };

    return { trip, saveTrip };
}
