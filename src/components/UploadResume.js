//code without dropddown
// import React, { useEffect, useState } from "react";
// import { useDropzone } from "react-dropzone";
// import axios from "axios";

// function UploadResume() {
//   const [file, setFile] = useState(null);
//   const [jobDescription, setJobDescription] = useState("");
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Handle file upload
//   const onDrop = (acceptedFiles) => {
//     setFile(acceptedFiles[0]);
//   };

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: ".pdf,.docx", // Allow only specific file types (optional)
//   });

//   // Handle job description input
//   const handleDescriptionChange = (e) => {
//     setJobDescription(e.target.value);
//   };

//   const handleAnalyzeClick = async () => {
//     if (!file || !jobDescription) {
//       alert("Please upload a resume and enter a job description!");
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append("resume_file", file); // Ensure this matches the backend key
//     formData.append("job_desc_file", jobDescription); // Mimic a file upload
  
//     setLoading(true);
  
//     try {
//       const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setResults(response.data.result); // Display results
//     } catch (error) {
//       console.error("Error during analysis:", error.response?.data || error.message);
//       alert(`Error: ${error.response?.data?.detail || "Unknown error"}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (results) {
//       console.log("Results in useEffect", results);
//     }
//   }, [results]);

//   return (
//     <div className="app-container">
//       <h1 className="title">Resume Analyzer</h1>

//       <div className="section">
//         <h2 className="section-title">Resume Upload Section</h2>
//         <div
//           {...getRootProps()}
//           className="upload-box"
//         >
//           <input {...getInputProps()} />
//           <p>Drag & drop a resume (PDF, DOCX) here, or click to select a file.</p>
//         </div>
//         {file && <p className="file-name">File: {file.name}</p>}
//       </div>

//       <div className="section">
//         <h2 className="section-title">Job Description Section</h2>
//         <textarea
//           placeholder="Enter job description"
//           value={jobDescription}
//           onChange={handleDescriptionChange}
//           rows="5"
//           className="text-input"
//         />
//       </div>

//       <button 
//         onClick={handleAnalyzeClick} 
//         className="analyze-button" 
//         disabled={loading}
//       >
//         {loading ? "Analyzing..." : "Analyze"}
//       </button>

//       {results && (
//         <div className="results">
//           <h3>Analysis Results</h3>
//           <p><strong>Matching Score:</strong> {results.score}%</p>
//           <p><strong>Recommendation:</strong> {results.recommendation}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UploadResume;

//code with dropdown options

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [modelChoice, setModelChoice] = useState("sbert"); // Default model
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".pdf,.docx",
  });

  // Handle job description input
  const handleDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  // Handle model choice change
  const handleModelChange = (e) => {
    setModelChoice(e.target.value);
  };

  const handleAnalyzeClick = async () => {
    if (!file || !jobDescription) {
      alert("Please upload a resume and enter a job description!");
      return;
    }

    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("job_desc_file", jobDescription);
    formData.append("model", modelChoice); // Send model choice to backend

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResults(response.data.result);
    } catch (error) {
      console.error("Error during analysis:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.detail || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (results) {
      console.log("Results in useEffect", results);
    }
  }, [results]);

  return (
    <div className="app-container">
      <h1 className="title">Resume Analyzer</h1>

      <div className="section">
        <h2 className="section-title">Model Selection</h2>
        <select
          value={modelChoice}
          onChange={handleModelChange}
          className="dropdown"
        >
          <option value="sbert">Sentence-BERT (SBERT)</option>
          <option value="huggingface">Hugging Face Transformers</option>
        </select>
      </div>

      <div className="section">
        <h2 className="section-title">Resume Upload Section</h2>
        <div {...getRootProps()} className="upload-box">
          <input {...getInputProps()} />
          <p>Drag & drop a resume (PDF, DOCX) here, or click to select a file.</p>
        </div>
        {file && <p className="file-name">File: {file.name}</p>}
      </div>

      <div className="section">
        <h2 className="section-title">Job Description Section</h2>
        <textarea
          placeholder="Enter job description"
          value={jobDescription}
          onChange={handleDescriptionChange}
          rows="5"
          className="text-input"
        />
      </div>

      <button
        onClick={handleAnalyzeClick}
        className="analyze-button"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {results && (
        <div className="results">
          <h3>Analysis Results</h3>
          <p>
            <strong>Matching Score:</strong> {results.score}%
          </p>
          <p>
            <strong>Recommendation:</strong> {results.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadResume;

