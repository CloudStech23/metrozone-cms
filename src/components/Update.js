import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig'; // Adjust the import path as needed
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateEvent = () => {
    const { id } = useParams(); // Get the event ID from the URL
    const navigate = useNavigate();
    const [event, setEvent] = useState({
        eventName: '',
        date: '',
        location: '',
        time: '',
        category: '',
        partner: '',
        description: '',
        images: [] // For storing image URLs
    });
    const [file, setFile] = useState(null); // For storing selected file
    // const [preview, setPreview] = useState(''); // For image preview

    useEffect(() => {
        const fetchEvent = async () => {
            const docRef = doc(db, 'events', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const eventData = docSnap.data();
                setEvent(eventData);
                // setPreview(eventData.images[0] || ''); // Set image preview if URL exists
            } else {
                console.error('No such document!');
            }
        };

        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvent({ ...event, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            // setPreview(URL.createObjectURL(file)); // Create a preview URL
        }
    };

    const handleImageDelete = async (imageUrl) => {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
            setEvent({
                ...event,
                images: event.images.filter(img => img !== imageUrl)
            });
            // setPreview('');
            alert('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image: ', error);
        }
    };

    const uploadImage = async (file) => {
        const storageRef = ref(storage, `events/${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrls = [...event.images];

            // Upload the new image if a file is selected
            if (file) {
                // Delete the old image if it exists
                if (event.images.length > 0) {
                    for (const oldImageUrl of event.images) {
                        const oldImageRef = ref(storage, oldImageUrl);
                        await deleteObject(oldImageRef);
                    }
                }

                const newImageUrl = await uploadImage(file);
                imageUrls.push(newImageUrl);
            }

            // Update the Firestore document
            const docRef = doc(db, 'events', id);
            await updateDoc(docRef, { ...event, images: imageUrls });
            alert('Event updated successfully!');
            navigate('/'); // Redirect to the main page or event table
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="container w-50">
                <h2>Update Event</h2>
                <form onSubmit={handleSubmit} className='needs-validation' noValidate>
                    <div className="form-group">
                        <label htmlFor="eventName">Event Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="eventName"
                            value={event.eventName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor='date'>Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={event.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            className="form-control"
                            name="location"
                            value={event.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                            type="text"
                            className="form-control"
                            name="time"
                            value={event.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input
                            type="text"
                            className="form-control"
                            name="category"
                            value={event.category}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="partner">Partner</label>
                        <input
                            type="text"
                            className="form-control"
                            name="partner"
                            value={event.partner}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={event.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="images">Event Images</label>
                        <input
                            type="file"
                            className="form-control"
                            name="images"
                            onChange={handleFileChange}
                        />
                        {/* <div className="image-preview mt-3">
                            {preview && <img src={preview} alt="Preview" />}
                        </div> */}
                        {event.images.length > 0 && (
                            <div className="mt-2">
                                {event.images.map((imageUrl, index) => (
                                    <div key={index} className="d-flex  align-items-center mb-2">
                                        <img src={imageUrl} alt='Preview' style={{ maxWidth: '100px', maxHeight: '100px'}} />
                                        <button variant="danger" onClick={() => handleImageDelete(imageUrl)}>
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button variant="primary" className='btn btn-primary' type="submit">
                        Update Event
                    </button>
                </form>
            </div>
        </div >
    );
};

export default UpdateEvent;
