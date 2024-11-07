// src/components/EventTable.js
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig'; // Adjust the import path as needed
import { collection, getDocs, getDoc, doc, deleteDoc,orderBy,query } from 'firebase/firestore';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { deleteObject, ref } from 'firebase/storage';


const EventTable = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    // Fetch events from Firestore
    const fetchEvents = async () => {
        const eventsRef = collection(db, 'events');
        // Query the collection, ordering by 'createdAt' in descending order
        const q = query(eventsRef, orderBy('createdAt', 'desc'));
    
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        setEvents(eventsList);
    };

    // Delete event
    const handleDelete = async (id) => {
        try {
            const eventDocRef = doc(db, 'events', id);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const mainimageurl = eventData.mainImage;
                const imagesurl = eventData.images || [];

                const deleteImagePromises = imagesurl.map((url) => {
                    const imageRef = ref(storage, url);
                    return deleteObject(imageRef);
                });

                if (mainimageurl) {
                    const mainImageRef = ref(storage, mainimageurl);
                    deleteObject(mainImageRef);
                }
                await Promise.all(deleteImagePromises);

                await deleteDoc(eventDocRef);
                fetchEvents();
            }
            else {
                console.log("Document does not exist");
            }
        } catch (error) {
            console.log('Error deleting document: ', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div className="container mt-4">
            <div className="container d-flex flex-row gap-3 mb-4">
                <button className="btn btn-success" onClick={() => navigate('/event')}>Add Event + </button>
                {/* <button className="btn btn-primary" style={{cursor:"not-allowed",pointerEvents:"none",color:" "}} onClick={() => navigate('/header')}>Add Header Item +</button>  */}
            </div>

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
                            <td className='col-2'>{event.partner}</td>
                            <td className='col-3'>{event.eventVenue}</td>
                            <td className='col-1'>{event.eventDate}</td>
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
