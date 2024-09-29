import React, { useState } from 'react';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import Loader from './Loader';

function Eventcsr() {
    const [eventData, setEventData] = useState({
        programType: 'Health-Care',
        title: '',
        description: '',
        eventDate: '',
        eventVenue: '',
        partner: '',
        beneficiary: '',  // New field: beneficiary
        value: '',  // New field: value in numbers
        quantity: '',  // New field: quantity in numbers
        images: [],
        mainImage: '',
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [mainImageFile, setMainImageFile] = useState(null);
    const [imageInputCount, setImageInputCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        setEventData({ ...eventData, [event.target.name]: event.target.value });
    };

    const handleMainImageChange = (event) => {
        setMainImageFile(event.target.files[0]);
    };

    const handleImageChange = (event, index) => {
        const files = [...imageFiles];
        files[index] = event.target.files[0];
        setImageFiles(files);
    };

    const addImageInput = () => {
        setImageInputCount(imageInputCount + 1);
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

    const uploadMainImage = async () => {
        if (mainImageFile) {
            const storageRef = ref(storage, `events/main/${mainImageFile.name}`);
            await uploadBytes(storageRef, mainImageFile);
            return await getDownloadURL(storageRef);
        }
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const mainImageUrl = await uploadMainImage();
            const imageUrls = await uploadImages();
            await addDoc(collection(db, 'events'), {
                ...eventData,
                mainImage: mainImageUrl,
                images: imageUrls,
                createdAt: serverTimestamp(),
            });
            alert('Event added successfully!');
            setEventData({
                programType: 'Health-Care',
                title: '',
                description: '',
                eventDate: '',
                eventVenue: '',
                partner: '',
                beneficiary: '',
                value: '',
                quantity: '',
                images: [],
                mainImage: '',
            });
            setImageFiles([]);
            setMainImageFile(null);
            setImageInputCount(1);
        } catch (e) {
            setError('Error adding event: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading){
        return <Loader/>
    }

     

    return (
        <div className="container mt-5">
            <h2>Upcoming Events</h2>
            <form onSubmit={handleSubmit} className="needs-validation">
                <div className="row">
                    <div className="col-md-7">
                        <div className="form-group mb-2">
                            <label htmlFor="programType">Program Type <span className="text-danger">*</span></label>
                            <select
                                className="form-control"
                                id="programType"
                                name="programType"
                                value={eventData.programType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Health-Care">Health-Care</option>
                                <option value="Sports">Sports</option>
                                <option value="Education">Education</option>
                                <option value="Army">Army</option>
                                 
                            </select>
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="title">Title <span className="text-danger">*</span> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>(Max 50 characters)</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                name="title"
                                maxLength="50"
                                value={eventData.title}
                                onChange={handleInputChange}
                                placeholder="Enter title"
                                required
                            />
                        </div>

                        {/* Partner */}
                        <div className="form-group mb-2">
                            <label htmlFor="partner">Partner <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="partner"
                                name="partner"
                                value={eventData.partner}
                                onChange={handleInputChange}
                                placeholder="Enter partner"
                                required
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="description">Description <span className="text-danger">*</span></label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                rows="3"
                                value={eventData.description}
                                onChange={handleInputChange}
                                placeholder="Enter description"
                                required
                            ></textarea>
                        </div>



                        <div className="form-group mb-2">
                            <label htmlFor="beneficiary">Beneficiary <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="beneficiary"
                                name="beneficiary"
                                value={eventData.beneficiary}
                                onChange={handleInputChange}
                                placeholder="Enter beneficiary"
                                required
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="value">Value <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control"
                                id="value"
                                name="value"
                                value={eventData.value}
                                onChange={handleInputChange}
                                placeholder="Enter value in numbers"
                                required
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="quantity">Quantity <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control"
                                id="quantity"
                                name="quantity"
                                value={eventData.quantity}
                                onChange={handleInputChange}
                                placeholder="Enter quantity"
                                required
                            />
                        </div>
                    </div>

                    <div className="col-md-5 mb-2">
                        <div className="form-group mb-2">
                            <label htmlFor="eventDate">Event Date <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className="form-control"
                                id="eventDate"
                                name="eventDate"
                                value={eventData.eventDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="eventVenue">Event Venue <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="eventVenue"
                                name="eventVenue"
                                value={eventData.eventVenue}
                                onChange={handleInputChange}
                                placeholder="Enter venue"
                                required
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="mainImage" className="col-sm-3 col-form-label"><strong>Main Image</strong> <span className="text-danger">*</span></label>
                            <div className="col-sm-9">
                                <input
                                    type="file"
                                    className="form-control-file"
                                    onChange={handleMainImageChange}
                                    accept="image/*"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Upload Images</th>
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
                                                    <label className="form-check-label" htmlFor={`highRes-${index}`}>is in Media ?</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="checkbox" className="form-check-input" id={`includeWatermark-${index}`} />
                                                    <label className="form-check-label" htmlFor={`includeWatermark-${index}`}>is in letter</label>
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


                <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                    Add Event
                </button>
                {error && <p className="text-danger mt-3">{error}</p>}
            </form>
        </div>
    );
}

export default Eventcsr;