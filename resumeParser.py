

##code with huggingface or sbert
from fastapi import FastAPI, UploadFile, File, Body, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
import PyPDF2
import docx
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer, util
import torch
from typing import Dict

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions for file processing
def extract_text_from_pdf(file: UploadFile) -> str:
    try:
        file_content = BytesIO(file.file.read())
        reader = PyPDF2.PdfReader(file_content)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF file: {str(e)}")

def extract_text_from_docx(file: UploadFile) -> str:
    try:
        file_content = BytesIO(file.file.read())
        doc = docx.Document(file_content)
        text = ""
        for para in doc.paragraphs:
            text += para.text
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Word file: {str(e)}")

# Analysis functions
def analyze_with_huggingface(job_desc: str, resume: str) -> Dict:
    try:
        model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)

        inputs = tokenizer(job_desc, resume, return_tensors="pt", padding="max_length", truncation=True, max_length=512)

        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits

        score = torch.sigmoid(logits).item() * 100
        score = round(score, 2)
        recommendation = "Good match!" if score > 75 else "Fair match, consider improving the resume."

        return {"score": score, "recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text with Hugging Face: {str(e)}")

def analyze_with_sbert(job_desc: str, resume: str) -> Dict:
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        job_desc_embedding = model.encode(job_desc, convert_to_tensor=True)
        resume_embedding = model.encode(resume, convert_to_tensor=True)

        similarity_score = util.cos_sim(job_desc_embedding, resume_embedding).item() * 100
        similarity_score = round(similarity_score, 2)
        recommendation = "Good match!" if similarity_score > 75 else "Fair match, consider improving the resume."

        return {"score": similarity_score, "recommendation": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing text with SBERT: {str(e)}")

# API endpoint
@app.post("/analyze/")
async def analyze_files(
    resume_file: UploadFile = File(...),
    job_desc_file: str = Form(...),
    model: str = Form("sbert")
):
    try:
        if resume_file.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(resume_file)
        else:
            resume_text = extract_text_from_docx(resume_file)

        job_desc_text = job_desc_file.strip()

        if model == "huggingface":
            analysis_result = analyze_with_huggingface(job_desc_text, resume_text)
        else:
            analysis_result = analyze_with_sbert(job_desc_text, resume_text)

        return {"message": "Analysis complete", "result": analysis_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing files: {str(e)}")




