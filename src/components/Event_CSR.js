import React, { useState } from 'react';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

function Eventcsr() {
    const [eventData, setEventData] = useState({
        programType: 'Education',
        title: '',
        description: '',
        eventDate: '',
        eventVenue: '',
        partner: '',
        images: [],
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imageInputCount, setImageInputCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        setEventData({ ...eventData, [event.target.name]: event.target.value });
    };

    const handleImageChange = (event, index) => {
        const files = [...imageFiles];
        files[index] = event.target.files[0];
        setImageFiles(files);
    };

    const addImageInput = () => {
        setImageInputCount(imageInputCount + 1); // Add a new input field
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
                ...eventData,
                images: imageUrls,
            });
            alert('Event added successfully!');
            setEventData({
                programType: 'Education',
                title: '',
                description: '',
                eventDate: '',
                eventVenue: '',
                partner: '',
                images: [],
            });
            setImageFiles([]);
            setImageInputCount(1);
        } catch (e) {
            setError('Error adding event: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Upcoming Events</h2>
            <form onSubmit={handleSubmit} className='needs-validation'>
                <div className="row">
                    <div className="col-md-7">
                        <div className="form-group">
                            <label htmlFor="programType">Program Type</label>
                            <select
                                className="form-control"
                                id="programType"
                                name="programType"
                                value={eventData.programType}
                                onChange={handleInputChange}
                            >
                                <option value="Education">Education Development</option>
                                <option value="skillDevelopment">Skill Development</option>
                                <option value="ruralDevelopment">Rural Development</option>
                                <option value="waterSanitation">Water & Sanitation</option>
                                <option value="healthcare">Healthcare</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="title">Title <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>(Content should be only in English and character limit is 50 with space)</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                name="title"
                                maxLength="50"
                                value={eventData.title}
                                onChange={handleInputChange}
                                placeholder="Enter title"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                rows="3"
                                value={eventData.description}
                                onChange={handleInputChange}
                                placeholder="Enter description"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="eventDate">Event Date</label>
                            <input
                                type="date"
                                className="form-control"
                                id="eventDate"
                                name="eventDate"
                                value={eventData.eventDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="col-md-5">
                        <div style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Upload Image</th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: imageInputCount }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="col-md-6">
                                                <input
                                                    type="file"
                                                    className="form-control-file"
                                                    onChange={(e) => handleImageChange(e, index)}
                                                    accept="image/*"
                                                />
                                            </td>
                                            <td className="col-md-6">
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id={`highRes-${index}`} />
                                                    <label className="form-check-label" htmlFor={`highRes-${index}`}>High Resolution</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id={`includeWatermark-${index}`} />
                                                    <label className="form-check-label" htmlFor={`includeWatermark-${index}`}>Include Watermark</label>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <span>
                            {imageInputCount === 0 && <p>No images added. Please add images.</p>}
                            <button type="button" onClick={addImageInput} className="btn btn-secondary mb-3">Add Image</button>
                        </span>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="eventVenue">Event Venue</label>
                    <input
                        type="text"
                        className="form-control"
                        id="eventVenue"
                        name="eventVenue"
                        value={eventData.eventVenue}
                        onChange={handleInputChange}
                        placeholder="Enter venue"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="partner">Partner</label>
                    <input
                        type="text"
                        className="form-control"
                        id="partner"
                        name="partner"
                        value={eventData.partner}
                        onChange={handleInputChange}
                        placeholder="Enter partner"
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                    {loading ? 'Submitting...' : 'Add Event'}
                </button>
                {error && <p className="text-danger mt-3">{error}</p>}
            </form>
        </div>
    );
}

export default Eventcsr;
