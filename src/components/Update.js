import React, { useState, useEffect,useRef } from "react";
import { db, storage } from "../firebaseConfig"; // Adjust the import path as needed
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useParams, useNavigate } from "react-router-dom";

const UpdateEvent = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    programType: "Health",
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
  const [mainImageFile] = useState(null); // Store selected main image
  const [imageFiles, setImageFiles] = useState([]); // Store selected additional images
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageInputCount, setImageInputCount] = useState(1); // Controls number of image inputs
  const scrollRef = useRef(null); // Step 1: Define the scrollRef

  useEffect(() => {
    const fetchEvent = async () => {
      const docRef = doc(db, "events", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const eventData = docSnap.data();
        setEventData(eventData);
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

  // Handle changes to the main image
  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (eventData.mainImage) {
        const previousImageUrl = eventData.mainImage;
        const urlParts = previousImageUrl.split("?")[0].split("/");
        const path = urlParts
          .slice(urlParts.indexOf("o") + 1)
          .join("/")
          .replace(/%2F/g, "/");
        const previousImageRef = ref(storage, path);
        try {
          console.log("Deleting previous image at path:", path);
          await deleteObject(previousImageRef);
          console.log("Previous image deleted successfully.");
        } catch (error) {
          console.error("Error deleting previous image:", error.message);
          setError("Failed to delete previous image. Please try again.");
          return;
        }
      }
      const storageRef = ref(storage, `events/main/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update state with the new Firebase URL
        setEventData({
          ...eventData,
          mainImage: downloadURL, // Use the Firebase URL, not the local blob URL
        });

        console.log("New main image uploaded successfully:", downloadURL);
      } catch (error) {
        console.error("Error uploading new main image:", error.message);
        setError("Failed to upload new main image. Please try again.");
      }
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
      images: [...eventData.images, null], // Add a new empty image placeholder
    });
    setImageFiles([...imageFiles, null]); // Ensure imageFiles has a placeholder for the new input
    setImageInputCount(imageInputCount + 1);

    // Scroll to the bottom after adding a new image input
    setTimeout(() => {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 100); // Small delay to ensure the DOM updates before scrolling
  };

  // Delete an image from Firebase Storage and remove its reference from Firestore
  const handleImageDelete = async (imageUrl) => {
    try {
      const urlParts = imageUrl.split("?")[0].split("/");
      const path = urlParts
        .slice(urlParts.indexOf("o") + 1)
        .join("/")
        .replace(/%2F/g, "/");

      // Delete the image from Firebase Storage
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);

      // Remove the image URL from the local state
      const updatedImages = eventData.images.filter((img) => img !== imageUrl);
      setEventData({ ...eventData, images: updatedImages });

      // Update Firestore with the new images array
      const docRef = doc(db, "events", id);
      await updateDoc(docRef, { images: updatedImages });

      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image: ", error);
      setError("Error deleting the image. Please try again.");
    }
  };

  // Upload images to Firebase Storage
  const uploadmainImage = async (file) => {
    const storageRef = ref(storage, `events/main/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef); // Return the download URL
  };

  const uploadImages = async (file) => {
    const storageRef = ref(storage, `events/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef); // Return the download URL
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls = [...eventData.images];

      // Upload main image if a new one is selected
      if (mainImageFile) {
        const mainImageUrl = await uploadmainImage(mainImageFile);
        setEventData({ ...eventData, mainImage: mainImageUrl }); // Add main image to the array
      }

      // Upload additional images
      for (let file of imageFiles) {
        if (file) {
          const imageUrl = await uploadImages(file);
          imageUrls.push(imageUrl);
        }
      }

      // Update the Firestore document
      const docRef = doc(db, "events", id);
      await updateDoc(docRef, { ...eventData, images: imageUrls });

      alert("Event updated successfully!");
      navigate("/"); // Redirect to the main page or event list
    } catch (error) {
      console.error("Error updating document: ", error);
      setError("Error updating the event. Please try again.");
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
              </select>
            </div>

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
              <label>Main Image</label>
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
                {eventData.mainImage ? (
                  <div className="mt-2 mb-2 p-2 border rounded bg-light">
                    <div className="row align-items-center">
                      <div className="col-md-4 text-end">
                        <img
                          src={eventData.mainImage}
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
                          onChange={handleMainImageChange}
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
            </div>

            <div className="form-group mb-2">
              <label>Images</label>
              <div
                ref={scrollRef} // Step 2: Attach scrollRef here
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
                          onChange={(e) => handleImageChange(e, index)}
                          accept="image/*"
                        />
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleImageDelete(img)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
          {loading ? "Updating..." : "Update Event"}
        </button>
        {error && <p className="text-danger mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default UpdateEvent;
