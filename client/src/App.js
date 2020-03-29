import React, { useState } from "react";
import "./App.css";

function App() {
  let previewImageUrl = "";

  const [previewSrc, setPreviewSrc] = useState(" ");

  const fileSelected = e => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0] || null;

    reader.onloadend = () => {
      previewImageUrl = reader.result;
      setPreviewSrc(previewImageUrl);
    };

    reader.readAsDataURL(file);
  };

  return (
    <section className="container">
      <div className="row">
        <div className="col-12">
          <div className="form-group" style={{ maxHeight: "100%" }}>
            <input
              form="imgform"
              type="file"
              id="upload"
              hidden
              onChange={fileSelected}
            />
            <label for="upload" className="image-area">
              <span id="upload-label" className="text-muted mb-3">
                Upload your RAW file here
              </span>
              <img
                id="imageResult"
                src={previewSrc}
                alt=""
                className="img-fluid rounded"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;
