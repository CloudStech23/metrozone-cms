import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig"; // Adjust the import path as needed
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { deleteObject, ref } from "firebase/storage";
import Loader from "./Loader"; // Adjust the import path for Loader

const EventTable = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false); // State for loader
  const [deletingId, setDeletingId] = useState(null); // Track the ID of the event being deleted
  const navigate = useNavigate();

  // Fetch events from Firestore
  const fetchEvents = async () => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const eventsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setEvents(eventsList);
  };

  // Delete event
  const handleDelete = async (id) => {
    setLoading(true);
    setDeletingId(id); // Set the deleting ID
    try {
      const eventDocRef = doc(db, "events", id);
      const eventDoc = await getDoc(eventDocRef);

      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        const mainImageUrl = eventData.mainImage;
        const imagesUrls = eventData.images || [];

        // Attempt to delete all associated images from Firebase Storage
        const deleteImagePromises = imagesUrls.map((url) => {
          const imageRef = ref(storage, url);
          return deleteObject(imageRef).catch((error) => {
            console.warn(
              `Image at ${url} not found or failed to delete:`,
              error
            );
          });
        });

        if (mainImageUrl) {
          const mainImageRef = ref(storage, mainImageUrl);
          await deleteObject(mainImageRef).catch((error) => {
            console.warn(
              `Main image at ${mainImageUrl} not found or failed to delete:`,
              error
            );
          });
        }

        // Wait for all image deletion attempts to complete
        await Promise.all(deleteImagePromises);

        // Proceed to delete the Firestore document
        await deleteDoc(eventDocRef);

        // Refresh the events list
        fetchEvents();

        console.log(`Event with ID: ${id} deleted successfully.`);
      } else {
        console.log(`Event with ID: ${id} does not exist in Firestore.`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setLoading(false);
      setDeletingId(null); // Reset the deleting ID
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container mt-4">
      <div className="container d-flex flex-row gap-3 mb-4">
        <button className="btn btn-success" onClick={() => navigate("/event")}>
          Add Event +
        </button>
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
              <td className="col-2">{event.partner}</td>
              <td className="col-3">{event.eventVenue}</td>
              <td className="col-1">{event.eventDate}</td>
              <td>
                <Button
                  variant="warning"
                  onClick={() => navigate(`/update/${event.id}`)}
                >
                  Update
                </Button>
                <Button
                  variant="danger"
                  className="ml-2 m-1"
                  onClick={() => handleDelete(event.id)}
                  disabled={loading && deletingId === event.id}
                >
                  {loading && deletingId === event.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {loading && <Loader />} {/* Display loader if loading */}
    </div>
  );
};

export default EventTable;
