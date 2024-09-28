import React, { useState } from 'react';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

function HomeData() {
    const [formData, setFormData] = useState({
        header_image: null,
        header_description: '',
        home_page_description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (event) => {
        setFormData({ ...formData, header_image: event.target.files[0] });
    };

    const uploadImage = async (file) => {
        const storageRef = ref(storage, `headers/${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const imageUrl = await uploadImage(formData.header_image);
            await addDoc(collection(db, 'headers'), {
                header_image: imageUrl,
                header_description: formData.header_description,
                home_page_description: formData.home_page_description,
            });
            alert('Form submitted successfully!');
            setFormData({
                header_image: null,
                header_description: '',
                home_page_description: '',
            });
        } catch (e) {
            setError('Error submitting form: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="container w-50">
                <h2>Header Information Form</h2>
                <form onSubmit={handleSubmit} className="needs-validation">
                    {/* Header Image */}


                    {/* Header Description */}
                    <div className="form-group mb-3">
                        <label htmlFor="header_description">Header Description</label>
                        <input
                            type="text"
                            className="form-control"
                            id="header_description"
                            name="header_description"
                            value={formData.header_description}
                            onChange={handleInputChange}
                            placeholder="Enter header description"
                            required
                        />
                    </div>

                    {/* Home Page Description */}
                    <div className="form-group mb-3">
                        <label htmlFor="home_page_description">Home Page Description</label>
                        <textarea
                            className="form-control"
                            id="home_page_description"
                            name="home_page_description"
                            rows="3"
                            value={formData.home_page_description}
                            onChange={handleInputChange}
                            placeholder="Enter home page description"
                            required
                        ></textarea>
                    </div>
                    <div className="form-group mb-2">
                        <label htmlFor="header_image" className='col-sm-3 col-form-label'>Header Image</label>
                        <div className="col-sm-9">
                            <input
                                type="file"
                                className="form-control-file"
                                id="header_image"
                                onChange={handleImageChange}
                                accept="image/*"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    {error && <p className="text-danger mt-3">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default HomeData;
