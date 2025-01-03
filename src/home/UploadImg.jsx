import { useState, useEffect } from "react";
import axios from "axios";
import fileSaver from "file-saver";
import "./style.css";

function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingType, setProcessingType] = useState("grayscale");

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setProcessedImage(null);
    setError(null);
  };

  const handleProcessingTypeChange = (event) => {
    setProcessingType(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!selectedImage) {
      setError("Please select an image to upload");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("processing_type", processingType);

    try {
      const response = await axios.post(
        "http://localhost:5000/process_image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProcessedImage(response.data.image);
    } catch (error) {
      console.error("Error processing image:", error);
      setError(error.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) {
      return;
    }

    const data = `data:image/jpeg;base64,${processedImage}`;
    const filename = `processed.jpg`;
    fileSaver.saveAs(data, filename);
  };

  useEffect(() => {
    if (selectedImage) {
      const cardTitles = document.querySelectorAll(".card-title");
      const rowContent = document.querySelectorAll(".row");

      rowContent.forEach((row) => {
        row.style.display = "flex";
      });

      cardTitles.forEach((title) => {
        title.style.display = "block";
      });
    }
  }, [selectedImage]);

  return (
    <>
      <div className="container">
      <h1>Image Processing App</h1>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col">
              <div className="card">
                <h3 className="card-title">Original Image</h3>
                {selectedImage && (
                  <img
                    className="image-preview"
                    src={URL.createObjectURL(selectedImage)}
                    alt="Original"
                  />
                )}
              </div>
            </div>
            <div className="col">
              <div className="card">
                <h3 className="card-title">Processed Image</h3>
                {processedImage && (
                  <img
                    className="image-preview"
                    src={`data:image/jpeg;base64,${processedImage}`}
                    alt="Processed"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="imageUpload">Select Image:</label>
            <input type="file" id="imageUpload" onChange={handleImageChange} />
          </div>
          <div className="form-group">
            <label htmlFor="processingType">Processing Type:</label>
            <select
              id="processingType"
              value={processingType}
              onChange={handleProcessingTypeChange}
            >
              <option value="grayscale">Grayscale</option>
              <option value="invert">Invert</option>
              <option value="blur">Blur</option>
            </select>
          </div>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Processing..." : "Process Image"}
          </button>
          <button
            type="button"
            className="btn downBtn"
            onClick={handleDownload}
            disabled={!processedImage}
          >
            Download Image
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </>
  );
}

export default ImageUpload;
