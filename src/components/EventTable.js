// src/components/EventTable.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Adjust the import path as needed
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';



const EventTable = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    // Fetch events from Firestore
    const fetchEvents = async () => {
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
    };

    // Delete event
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'events', id));
            fetchEvents(); // Refresh the table
        } catch (e) {
            console.error('Error deleting document: ', e);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Events Table</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Program</th>
                        <th>Title</th>
                        <th>Partner</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td>{event.programType}</td>
                            <td>{event.title}</td>
                            <td>{event.partner}</td>
                            <td>{event.eventVenue}</td>
                            <td>{event.eventDate}</td>
                            <td>
                                <Button variant="warning" onClick={() => navigate(`/update/${event.id}`)}>Update</Button>
                                <Button variant="danger" className="ml-2 m-1" onClick={() => handleDelete(event.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default EventTable;
