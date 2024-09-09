import React, { useState } from 'react';
import { db, storage } from '../firebaseConfig'; // Update path as needed
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';


const EventForm = () => {
    const [event, setEvent] = useState({
        eventName: '',
        date: '',
        location: '',
        time: '',
        category: '',
        partner: '',
        description: '',
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imageInputs, setImageInputs] = useState([0]); // Start with one image input
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setEvent({ ...event, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e, index) => {
        const files = [...imageFiles];
        files[index] = e.target.files[0];
        setImageFiles(files);
    };

    const addImageInput = () => {
        setImageInputs([...imageInputs, imageInputs.length]); // Add a new input field
    };

    const uploadImages = async () => {
        const imageUrls = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (file) {
                const storageRef = ref(storage, `events/${file.name}`);
                await uploadBytes(storageRef, file);
                const fileUrl = await getDownloadURL(storageRef);
                imageUrls.push(fileUrl);
            }
        }
        return imageUrls;
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const imageUrls = await uploadImages();
            await addDoc(collection(db, 'events'), {
                ...event,
                images: imageUrls,
            });
            alert('Event added successfully!');
            setEvent({
                eventName: '',
                date: '',
                location: '',
                time: '',
                category: '',
                partner: '',
                description: '',
                images: []
            });
            setImageFiles([]);
            setImageInputs([0]);
        } catch (e) {
            setError('Error adding event: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="container w-50">
                <h2>Add New Event</h2>
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="form-group">
                        <label htmlFor="eventName">Event Name</label>
                        <input
                            type="text"
                            id="eventName"
                            name="eventName"
                            className="form-control"
                            value={event.eventName}
                            onChange={handleInputChange}
                            placeholder="Event Name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            className="form-control"
                            value={event.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            className="form-control"
                            value={event.location}
                            onChange={handleInputChange}
                            placeholder="Location"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <input
                            type="text"
                            id="time"
                            name="time"
                            className="form-control"
                            value={event.time}
                            onChange={handleInputChange}
                            placeholder="Time"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            className="form-control"
                            value={event.category}
                            onChange={handleInputChange}
                            placeholder="Category"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="partner">Partner</label>
                        <input
                            type="text"
                            id="partner"
                            name="partner"
                            className="form-control"
                            value={event.partner}
                            onChange={handleInputChange}
                            placeholder="Partner"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-control"
                            value={event.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                            required
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label>Images</label>
                        {imageInputs.map((input, index) => (
                            <div key={index} className="input-group mb-3">
                                <input
                                    type="file"
                                    className="form-control-file"
                                    onChange={(e) => handleImageChange(e, index)}
                                />
                                {index === imageInputs.length - 1 && (
                                    <div className="input-group-append">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={addImageInput}
                                        >
                                            <i className="fas fa-plus"></i> Add More
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} >
                            {loading ? 'Adding...' : 'Add Event'}
                        </button>
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    
                </form>
            </div>
        </div>
    );
};

export default EventForm;
