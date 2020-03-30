import React, { useState } from "react";
import "./App.css";

function App() {
  let previewImageUrl = "";

  const [loading, setLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(" ");
  const [rawFile, setRawFile] = useState(" ");
  const [watermarkImg, setWatermarkImg] = useState(" ");

  const fileSelected = e => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0] || null;
    setRawFile(file);
    console.log("file: ", file);

    reader.onloadend = () => {
      previewImageUrl = reader.result;
      setPreviewSrc(previewImageUrl);
    };

    reader.readAsDataURL(file);
  };

  const fileUpload = async e => {
    e.preventDefault();
    if (previewSrc !== "") {
      // this.setState({ loading: true });
      setLoading(true);
      const fd = new FormData();
      console.log("at fd file is: ", rawFile);
      fd.append("rawimg", rawFile, rawFile.name);
      console.log(fd);
      const requestOptions = {
        method: "POST",
        body: fd
      };
      await fetch("/api/upload", requestOptions)
        .then(response => response.json())
        .then(data => setWatermarkImg(data.preview))
        .catch(err => console.log(err));
    }
    setLoading(false);
  };

  return (
    <section className="container">
      <div className="row">
        <div className="col-12 col-md-6">
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
        <div className="col-12 col-md-6">
          {loading ? (
            <div className="image-area">
              <div
                className="progress"
                style={{ width: "100%", height: "100%" }}
              >
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  aria-valuenow="75"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="image-area">
              <span id="upload-label" className="text-muted mb-3">
                Your watermarked image will appear here
              </span>
              <img src={watermarkImg} alt="" className="img-fluid rounded" />
            </div>
          )}
        </div>
      </div>
      <button className="btn btn-primary" onClick={fileUpload}>
        Generate watermark
      </button>
    </section>
  );
}

export default App;
