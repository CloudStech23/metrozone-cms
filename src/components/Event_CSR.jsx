import React, { useState } from "react";
import { db, storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import Loader from "./Loader";

function Eventcsr() {
  const [eventData, setEventData] = useState({
    programType: "Health-Care",
    title: "",
    description: "",
    eventDate: "",
    eventVenue: "",
    partner: "",
    beneficiarynum: "",
    beneficiarytext: "",
    value: "",
    quantity: "",
    unittype: '',
    quantvaluetext: "",
    images: [],
    mainImage: "",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, setImageUrls] = useState([]);

  const handleInputChange = (event) => {
    setEventData({ ...eventData, [event.target.name]: event.target.value });
  };

  const handleMainImageChange = (event) => {
    setMainImageFile(event.target.files[0]);
  };

  const handleImageChange = (event) => {
    const filesArray = Array.from(event.target.files);
    setImageFiles(filesArray);
  };

  const uploadImages = async () => {
    const uploadImageUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const storageRef = ref(storage, `events/${imageFile.name}`);

      try {
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadImageUrls.push(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error.message);
        setError('Error uploading images. Please try again.');
      }
    }

    return uploadImageUrls;
  };

  const uploadMainImage = async () => {
    if (mainImageFile) {
      const storageRef = ref(storage, `events/main/${mainImageFile.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, mainImageFile);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Error uploading main image:', error.message);
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Upload main image
      const mainImageUrl = await uploadMainImage();

      // Upload additional images
      const uploadedImageUrls = await uploadImages();

      // Save event data to Firestore
      await addDoc(collection(db, "events"), {
        ...eventData,
        mainImage: mainImageUrl,
        images: uploadedImageUrls,
        createdAt: serverTimestamp(),
      });

      alert("Event added successfully!");

      // Reset the form
      setEventData({
        programType: "Health-Care",
        title: "",
        description: "",
        eventDate: "",
        eventVenue: "",
        partner: "",
        beneficiarynum: "",
        beneficiarytext: "",
        value: "",
        quantity: "",
        unittype: '',
        quantvaluetext: "",
        images: [],
        mainImage: "",
      });
      setImageFiles([]);
      setMainImageFile(null);
      setImageUrls([]);
    } catch (e) {
      setError("Error adding event: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mt-5 py-4">
      <h2>Upcoming Events</h2>
      <form onSubmit={handleSubmit} className="needs-validation">
        <div className="row">
          <div className="col-md-7">
            {/* Program Type */}
            <div className="form-group mb-2">
              <label htmlFor="programType">
                Program Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="programType"
                name="programType"
                value={eventData.programType}
                onChange={handleInputChange}
                required
              >
                <option value="Health">Health</option>
                <option value="Sports">Sports</option>
                <option value="Education">Education</option>
                <option value="Womens Empowerment">Womens Empowerment</option>
              </select>
            </div>

            {/* Other form fields */}
            <div className="form-group mb-2">
              <label htmlFor="title">
                Title <span className="text-danger">*</span>{" "}
                <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                  (Max 50 characters)
                </span>
              </label><input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={eventData.title}
                onChange={handleInputChange}
                placeholder="Enter title"
                required
              />
            </div>

            {/* Partner */}
            <div className="form-group mb-2">
              <label htmlFor="partner">
                Partner <span className="text-danger">*</span>
              </label>
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
                rows='3'
                value={eventData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                required
              />
            </div>
            <div className="form-group mb-2">
              <label htmlFor="beneficiary">
                Beneficiary <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="beneficiarynum"
                name="beneficiarynum"
                value={eventData.beneficiarynum}
                onChange={handleInputChange}
                placeholder="Enter beneficiary number"
                required
              />
              <input
                type="text"
                className="form-control mt-2"
                id="beneficiarytext"
                name="beneficiarytext"
                value={eventData.beneficiarytext}
                onChange={handleInputChange}
                placeholder="Enter the description of beneficiary"
                required
              />
            </div>

            <div className="form-group mb-2">
              <label htmlFor="value">
                Contribution of value and quantity{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="value"
                name="value"
                value={eventData.value}
                onChange={handleInputChange}
                placeholder="Enter value in rupee"
                required
              />
              <div className="row">
                <div className="col">
                  <input
                    type="text"
                    className="form-control mt-2"
                    id="quantity"
                    name="quantity"
                    value={eventData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter the quantity"
                    required
                  />
                </div>
                <div className="col">
                  <input
                    type="text"
                    className="form-control mt-2"
                    id="unittype"
                    name="unittype"
                    value={eventData.unittype}
                    onChange={handleInputChange}
                    placeholder="Enter the unit type"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-control mt-2"
                    id="quantvaluetext"
                    name="quantvaluetext"
                    value={eventData.quantvaluetext}
                    onChange={handleInputChange}
                    placeholder="Enter the Description"
                    required
                  />
                </div>
              </div>
            </div>
          </div>







          <div className="col-md-5 mb-2">
            {/* Event Date, Venue, etc. */}
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
              <label htmlFor='mainImage' className='col-sm-3 col-form-label'>
                <strong>Main Image</strong>{" "}
                <span className="text-danger">*</span>
              </label>
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

            <div
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                overflowX: "hidden",
              }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Upload Images</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {/* if no image is uploaded yet */}
                  {imageFiles.length === 0 && (
                    <tr>
                      <td className="col-md-6">
                        <input
                          type="file"
                          className="form-control-file"
                          onChange={handleImageChange}
                          accept="image/*"
                          multiple
                        />
                      </td>
                      <td>
                        <div>No images uploaded yet. Please add images.</div>
                        <div className="mt-2 fw-bold text-danger">**You can upload multiple images at a time.**</div>
                      </td>
                         
                    </tr>
                  )}

                  {/* Display uploaded images */}
                  {imageFiles.length > 0 && imageFiles.map((file, index) => (
                    <tr key={index}>
                      <td className="col-md-6">
                        <div className="d-flex flex-column">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            width="100"
                            height="100"
                            style={{ objectFit: "cover" }}
                            className="mb-2"
                          />
                          <input
                            type="file"
                            className="form-control-file"
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`highRes-${index}`}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`highRes-${index}`}
                          >
                            is in Media ?
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`includeWatermark-${index}`}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`includeWatermark-${index}`}
                          >
                            is in letter
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* {imageFiles.length > 0 && (

                      <div className="mt-3">
                        <input
                          type="file"
                          className="form-control-file"
                          onChange={handleImageChange}
                          accept="image/*"
                          multiple
                        />
                        <h5>Selected Images:</h5>
                        <div className="d-flex flex-wrap">
                          {imageFiles.map((file, index) => (
                            <tr key={index}>
                              <td>
                                <img
                                  key={index}
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index}`}
                                  width="100"
                                  height="100"
                                  className="me-2 mb-2"
                                  style={{ objectFit: "cover" }}
                                />
                              </td>
                            </tr>
                          ))}
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            width="100"
                            height="100"
                            className="me-2 mb-2"
                            style={{ objectFit: "cover" }}
                          />
                          ))}
                        </div>
                      </div>
                    )} */}
                </tbody>
              </table>
            </div>
          </div>
        </div>





        {/* Main Image Upload */}
        {/* <div className="form-group mb-2">
              <label htmlFor="mainImage">Main Image <span className="text-danger">*</span></label>
              <input
                type="file"
                className="form-control-file"
                onChange={handleMainImageChange}
                accept="image/*"
                required
              />
            </div> */}

        {/* Images Upload */}
        {/* <div className="form-group mb-2">
              <label htmlFor="eventImages">Upload Additional Images</label>
              <input
                type="file"
                className="form-control-file"
                onChange={handleImageChange}
                accept="image/*"
                multiple
              />
              {imageFiles.length > 0 && (
                <div className="mt-3">
                  <h5>Selected Images:</h5>
                  <div className="d-flex flex-wrap">
                    {imageFiles.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        width="100"
                        height="100"
                        className="me-2 mb-2"
                        style={{ objectFit: "cover" }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div> */}




        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
          Add Event
        </button>
        {error && <p className="text-danger mt-3">{error}</p>}
      </form >
    </div >
  );
}

export default Eventcsr;
