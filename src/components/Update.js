import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig'; // Adjust the import path as needed
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateEvent = () => {
    const { id } = useParams(); // Get the event ID from the URL
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        programType: 'Education',
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
    const [mainImageFile, setMainImageFile] = useState(null); // Store selected main image
    const [imageFiles, setImageFiles] = useState([]); // Store selected additional images
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageInputCount, setImageInputCount] = useState(1); // Controls number of image inputs

    useEffect(() => {
        const fetchEvent = async () => {
            const docRef = doc(db, 'events', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const eventData = docSnap.data();
                setEventData(eventData);
            } else {
                console.error('No such document!');
            }
        };

        fetchEvent();
    }, [id]);

    // Handle input changes for text fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    // Handle changes to the main image
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            const previewURL = URL.createObjectURL(file);
            setEventData({ ...eventData, mainImage: previewURL }); // Update main image preview only
        }
    };

    // Handle changes for additional images
    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            let newImageFiles = [...imageFiles];
            newImageFiles[index] = file;
            setImageFiles(newImageFiles);

            // Generate preview URL for the selected image
            const previewURL = URL.createObjectURL(file);
            let newImages = [...eventData.images];
            newImages[index] = previewURL;
            setEventData({ ...eventData, images: newImages });
        }
    };

    // Add a new image input field
    const addImageInput = () => {
        setEventData({
            ...eventData,
            images: [...eventData.images, null],  // Add a new empty image placeholder
        });
        setImageFiles([...imageFiles, null]); // Ensure imageFiles has a placeholder for the new input
        setImageInputCount(imageInputCount + 1);
    };

    // Delete an image from Firebase Storage and remove its reference from Firestore
    const handleImageDelete = async (imageUrl) => {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);

            // Remove the image URL from the local state
            const updatedImages = eventData.images.filter(img => img !== imageUrl);
            setEventData({ ...eventData, images: updatedImages });

            // Update Firestore with the new images array
            const docRef = doc(db, 'events', id);
            await updateDoc(docRef, { images: updatedImages });

            alert('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image: ', error);
            setError('Error deleting the image. Please try again.');
        }
    };

    // Upload images to Firebase Storage
    const uploadImage = async (file, isMainImage) => {
        const storageRef = ref(storage, `events/${isMainImage ? 'main/' : ''}${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);  // Return the download URL
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrls = [];

            // Upload main image if a new one is selected
            if (mainImageFile) {
                const mainImageUrl = await uploadImage(mainImageFile, true);
                imageUrls.push(mainImageUrl); // Add main image to the array
            }

            // Upload additional images
            for (let file of imageFiles) {
                if (file) {
                    const imageUrl = await uploadImage(file, false);
                    imageUrls.push(imageUrl);
                }
            }

            // Update the Firestore document
            const docRef = doc(db, 'events', id);
            await updateDoc(docRef, { ...eventData, images: imageUrls });

            alert('Event updated successfully!');
            navigate('/'); // Redirect to the main page or event list
        } catch (error) {
            console.error('Error updating document: ', error);
            setError('Error updating the event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Update Event</h2>
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
                                <option value="Education">Education Development</option>
                                <option value="skillDevelopment">Skill Development</option>
                                <option value="ruralDevelopment">Rural Development</option>
                                <option value="waterSanitation">Water & Sanitation</option>
                                <option value="healthcare">Healthcare</option>
                            </select>
                        </div>

                        <div className="form-group mb-2">
                            <label htmlFor="title">Title <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                name="title"
                                value={eventData.title}
                                onChange={handleInputChange}
                                maxLength="50"
                                placeholder="Enter title"
                                required
                            />
                        </div>

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
                                placeholder="Enter value"
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

                    <div className="col-md-5">
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
                                placeholder="Enter event venue"
                                required
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label>Main Image</label>
                            <input
                                type="file"
                                className="form-control"
                                onChange={handleMainImageChange}
                                accept="image/*"
                            />
                            {eventData.mainImage && (
                                <div className="mt-2">
                                    <img
                                        src={eventData.mainImage}
                                        alt="Main Preview"
                                        style={{ maxHeight: '150px' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group mb-2">
                            <label>Additional Images</label>
                            {eventData.images.map((img, index) => (
                                <div key={index} className="mt-2">
                                    <input
                                        type="file"
                                        className="form-control mb-1"
                                        onChange={(e) => handleImageChange(e, index)}
                                        accept="image/*"
                                    />
                                    {img && (
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={img}
                                                alt={`Preview ${index}`}
                                                style={{ maxHeight: '100px', marginRight: '10px' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => handleImageDelete(img)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-primary mt-2"
                                onClick={addImageInput}
                            >
                                Add More Images
                            </button>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Event'}
                </button>
                {error && <p className="text-danger mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default UpdateEvent;
