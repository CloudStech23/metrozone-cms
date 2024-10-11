import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig"; // Adjust the import path as needed
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "./Loader";

const UpdateEvent = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    programType: "",
    customProgramType: "",
    title: "",
    description: "",
    eventDate: "",
    eventVenue: "",
    partner: "",
    beneficiarynum: "",
    beneficiarytext: "",
    value: "",
    quantity: "",
    unittype: "",
    quantvaluetext: "",
    images: [],
    mainImage: "",
  });
  const [mainImageFile, setMainImageFile] = useState(null); // Store selected main image
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch event data on component mount
  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, "events", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const eventData = docSnap.data();
        setEventData({
          ...eventData,
          programType: eventData.programType === "Health" || eventData.programType === "Sports" || eventData.programType === "Education" || eventData.programType === "Womens Empowerment"
            ? eventData.programType
            : "Other", // Check if the programType is not one of the predefined options
          customProgramType: eventData.programType !== "Health" && eventData.programType !== "Sports" && eventData.programType !== "Education" && eventData.programType !== "Womens Empowerment"
            ? eventData.programType
            : "",
        });
        setMainImageFile(eventData.mainImage);
      } else {
        console.error("No such document!");
      }
    };

    fetchEvent();
  }, [id]);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  // Delete an image from storage and Firestore
  const deleteImage = async (imageUrl) => {
    try {
      const decodedUrl = decodeURIComponent(imageUrl);
      const pathStartIndex = decodedUrl.indexOf("/o/") + 3; // Start after '/o/'
      const pathEndIndex = decodedUrl.indexOf("?alt=");
      const objectPath = decodedUrl.substring(pathStartIndex, pathEndIndex);
      const imageRef = ref(storage, objectPath);
      await deleteObject(imageRef);
      console.log("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  // Handle changes to the main image
  const handleMainImageChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const filename = file.name;
      const mainImageRef = ref(storage, `events/main/${filename}`);

      // Delete the previous main image if it exists
      if (mainImageFile) {
        await deleteImage(mainImageFile);
      }

      const snapshot = await uploadBytes(mainImageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setMainImageFile(downloadURL); // Update local state

      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, { mainImage: downloadURL }); // Update Firestore
    } catch (error) {
      console.error("Error handling main image:", error);
      setError("Failed to upload new main image. Please try again.");
    }
    if (loading) {
      return <Loader />;
    }
  };

  // Handle adding new images
  const handleImageChange = async (e) => {
    try {
      const files = e.target.files;
      const newImageFiles = [];

      for (const file of files) {
        const fileName = file.name;
        const imageRef = ref(storage, `events/${fileName}`);

        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        newImageFiles.push(downloadURL);
      }

      const updatedImages = [...eventData.images, ...newImageFiles];
      setEventData({ ...eventData, images: updatedImages });

      // Update the Firestore document
      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, { images: updatedImages });
    } catch (error) {
      console.error("Error handling image upload:", error);
      setError("Failed to upload new image. Please try again.");
    }
  };


  // Handle deleting an additional image
  const handleImageDelete = async (imageUrl, index) => {
    try {
      const decodedUrl = decodeURIComponent(imageUrl);
      const pathStartIndex = decodedUrl.indexOf("/o/") + 3;
      const pathEndIndex = decodedUrl.indexOf("?alt=");
      const objectPath = decodedUrl.substring(pathStartIndex, pathEndIndex);
      const imageRef = ref(storage, objectPath);
      await deleteObject(imageRef);

      const updatedImages = eventData.images.filter((_, i) => i !== index);
      setEventData({ ...eventData, images: updatedImages });

      const eventRef = doc(db, "events", id);
      await updateDoc(eventRef, { images: updatedImages });

      alert("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventRef = doc(db, "events", id);
      const finalProgramType = eventData.programType === "Other" ? eventData.customProgramType : eventData.programType;

      await updateDoc(eventRef, { ...eventData, programType: finalProgramType, mainImage: mainImageFile }); // Ensure main image is included in the update

      alert("Event updated successfully!");
      navigate("/"); // Redirect to the main page or event list
    } catch (error) {
      console.error("Error updating document:", error);
      setError("Error updating the eventData. Please try again.");
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
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Custom Program Type (when 'Other' is selected or was previously set) */}
            {eventData.programType === "Other" && (
              <div className="form-group mb-2">
                <label htmlFor="customProgramType">
                  Enter Program Type <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="customProgramType"
                  name="customProgramType"
                  value={eventData.customProgramType}
                  onChange={handleInputChange}
                  placeholder="Enter program type"
                  required
                />
              </div>
            )}

            <div className="form-group mb-2">
              <label htmlFor="title">
                Title <span className="text-danger">*</span>
              </label>
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
              <label htmlFor="description">
                Description <span className="text-danger">*</span>
              </label>
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
              <label htmlFor="beneficiary">
                Beneficiary <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="beneficiarynum"
                name="beneficiarynum"
                value={eventData.beneficiarynum}
                onChange={handleInputChange}
                placeholder="Enter beneficiary"
                required
              />
              <input
                type="text"
                className="form-control mt-2"
                id="beneficiarytext"
                name="beneficiarytext"
                value={eventData.beneficiarytext}
                onChange={handleInputChange}
                placeholder="Enter the description of beneficiary (This field is not mandatory)"

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
                {/* <div className="col">
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
                </div> */}
                {/* <div className="col">
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
                </div> */}
                <div>
                  <input
                    type="text"
                    className="form-control mt-2"
                    id="quantvaluetext"
                    name="quantvaluetext"
                    value={eventData.quantvaluetext}
                    onChange={handleInputChange}
                    placeholder="Enter the Description (This field is not mandatory)"

                  />
                </div>
              </div>
            </div>
          </div>

          {/* col-2 for images */}
          <div className="col-md-5">
            <div className="form-group mb-2">
              <label htmlFor="eventDate">
                Event Date <span className="text-danger">*</span>
              </label>
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
              <label htmlFor="eventVenue">
                Event Venue <span className="text-danger">*</span>
              </label>
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
              <label htmlFor="mainImage">
                Main Image <span className="text-danger">*</span>
              </label>
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                {mainImageFile ? (
                  <div className="mt-2 mb-2 p-2 border rounded bg-light">
                    <div className="row align-items-center">
                      <div className="col-md-4 text-end">
                        <img
                          src={mainImageFile}
                          alt="Main Preview"
                          style={{
                            maxHeight: "100px",
                            maxWidth: "150px",
                            marginRight: "10px",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <div className="col-md-8">
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => handleMainImageChange(e, id)}
                          accept="image/*"
                        />

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 mb-2 p-2 border rounded bg-light">
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleMainImageChange}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
              {/* <input
                type="file"
                className="form-control"
                id="mainImage"
                onChange={(e) => handleMainImageChange(e, id)}
              />
              {mainImageFile && (
                <img
                  src={mainImageFile}
                  alt="Main event"
                  className="img-thumbnail mt-2"
                  width="100"
                />
              )} */}
            </div>

            <div className="form-group mb-2">
              <label>
                Images <span className="text-danger">*</span>
              </label>
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                {eventData.images.map((img, index) => (
                  <div
                    key={index}
                    className="mt-2 mb-3 p-2 border rounded bg-light"
                  >
                    <div className="row align-items-center">
                      <div className="col-md-4 text-end">
                        {img && (
                          <div className="d-flex align-items-center">
                            <img
                              src={img}
                              alt={`Preview ${index}`}
                              style={{
                                maxHeight: "100px",
                                maxWidth: "150px",
                                marginRight: "10px",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="col-md-7">
                        <input
                          type="file"
                          className="form-control mb-1"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleImageDelete(img, index)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <span className="row mt-2">
                <div className="col-md-4">
                  <label>
                    Add Images
                  </label>
                </div>
                <div className="col-md-7">
                  <input
                    type="file"
                    className="form-control mb-1"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </span>
              {/* <input
                type="file"
                className="form-control"
                id="images"
                multiple
                onChange={handleImageChange}
              />
              {
                eventData.images.map((imageUrl, index) => (
                  <div key={index} className="mt-2">
                    <img
                      src={imageUrl}
                      alt={`Event ${index}`}
                      className="img-thumbnail"
                      width="100"
                    />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm ml-2"
                      onClick={() => handleImageDelete(imageUrl, index)}
                    >
                      Delete
                    </button>
                  </div>
                ))} */}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Event"}
        </button>
      </form >
      {error && <p className="text-danger mt-3">{error}</p>}
    </div >
  );
};

export default UpdateEvent;
