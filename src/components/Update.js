import React, { useState, useEffect, useMemo } from "react";
import { db, storage } from "../firebaseConfig";
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
  const { id } = useParams();
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
  const [mainImageFile, setMainImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const memoizedPrograms = useMemo(() => [
    "Health",
    "Sports",
    "Education",
    "Womens Empowerment",
  ], []);
  

  // const memoizedPrograms = useMemo(
  //   () => predefinedPrograms,
  //   [predefinedPrograms]
  // );

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEventData({
            ...data,
            programType: memoizedPrograms.includes(data.programType)
              ? data.programType
              : "Other",
            customProgramType: memoizedPrograms.includes(data.programType)
              ? ""
              : data.programType,
          });
          setMainImageFile(data.mainImage);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
  
    fetchEvent();
  }, [id, memoizedPrograms]); // No more warnings 🚀
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const deleteImage = async (imageUrl) => {
    try {
      if (!imageUrl) return;
      const path = decodeURIComponent(imageUrl)
        .split("/o/")[1]
        .split("?alt=")[0];
      await deleteObject(ref(storage, path));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleBrokenImage = (index) => {
    setEventData((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      updateDoc(doc(db, "events", id), { images: updatedImages });
      return { ...prev, images: updatedImages };
    });
  };

  const handleMainImageChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const mainImageRef = ref(storage, `events/main/${file.name}`);

      if (mainImageFile) await deleteImage(mainImageFile);

      const snapshot = await uploadBytes(mainImageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setMainImageFile(downloadURL);
      await updateDoc(doc(db, "events", id), { mainImage: downloadURL });
    } catch (error) {
      console.error("Error updating main image:", error);
      setError("Failed to upload main image. Please try again.");
    }
  };

  const handleImageChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      const newImages = await Promise.all(
        files.map(async (file) => {
          const snapshot = await uploadBytes(
            ref(storage, `events/${file.name}`),
            file
          );
          return getDownloadURL(snapshot.ref);
        })
      );

      setEventData((prev) => {
        const updatedImages = [...prev.images, ...newImages];
        updateDoc(doc(db, "events", id), { images: updatedImages });
        return { ...prev, images: updatedImages };
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload new images. Please try again.");
    }
  };

  const handleImageDelete = async (imageUrl, index) => {
    try {
      await deleteImage(imageUrl);
      setEventData((prev) => {
        const updatedImages = prev.images.filter((_, i) => i !== index);
        updateDoc(doc(db, "events", id), { images: updatedImages });
        return { ...prev, images: updatedImages };
      });
      alert("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalProgramType =
        eventData.programType === "Other"
          ? eventData.customProgramType
          : eventData.programType;
      await updateDoc(doc(db, "events", id), {
        ...eventData,
        programType: finalProgramType,
        mainImage: mainImageFile,
      });
      alert("Event updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating event:", error);
      setError("Error updating event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

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
                              onError={() => handleBrokenImage(index)}
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
                  <label>Add Images</label>
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
      </form>
      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
};

export default UpdateEvent;
