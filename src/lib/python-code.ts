export const PYTHON_BACKEND_CODE = `import fitz  # PyMuPDF
import numpy as np
from sklearn.cluster import DBSCAN
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import io

app = FastAPI(title="BookQC Backend")

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyze_pdf(file_bytes: bytes, filename: str):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    issues = []
    
    # Simple Unsupervised Learning for Layout Analysis
    # We cluster text blocks by their X, Y coordinates and Font Size
    # to identify Headers, Footers, and Body Text.
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        blocks = page.get_text("dict")["blocks"]
        
        # 1. Empty Page Detection
        if not blocks:
            issues.append({
                "type": "Empty Page",
                "page": page_num + 1,
                "description": "Page contains no text or images.",
                "severity": "high"
            })
            continue
            
        text_blocks = [b for b in blocks if b['type'] == 0]
        if not text_blocks:
            continue
            
        # Extract features for clustering: [y0, font_size]
        features = []
        for b in text_blocks:
            for l in b["lines"]:
                for s in l["spans"]:
                    text = s['text'].strip()
                    if text:
                        # Normalize y0 by page height to help clustering
                        y0_norm = s['bbox'][1] / page.rect.height
                        size_norm = s['size'] / 50.0 # Normalize font size
                        features.append([y0_norm, size_norm])
                        
        if len(features) > 3:
            X = np.array(features)
            # DBSCAN to find clusters of text (e.g., body paragraphs vs headers)
            clustering = DBSCAN(eps=0.05, min_samples=2).fit(X)
            labels = clustering.labels_
            
            # 2. Widow / Orphan Detection (Heuristic based on clusters)
            # If the first or last cluster on a page has only 1 line, flag it.
            unique_labels = set(labels)
            for label in unique_labels:
                if label == -1: continue # Noise
                cluster_indices = np.where(labels == label)[0]
                if len(cluster_indices) == 1:
                    # Single line cluster
                    y_pos = X[cluster_indices[0]][0]
                    if y_pos < 0.2: # Near top
                        issues.append({
                            "type": "Widow",
                            "page": page_num + 1,
                            "description": "Potential widow detected at the top of the page.",
                            "severity": "medium"
                        })
                    elif y_pos > 0.8: # Near bottom
                        issues.append({
                            "type": "Orphan",
                            "page": page_num + 1,
                            "description": "Potential orphan detected at the bottom of the page.",
                            "severity": "medium"
                        })
                        
        # 3. Page Number Check
        # Look for isolated numbers in the header/footer regions (y < 0.1 or y > 0.9)
        has_page_num = False
        for b in text_blocks:
            for l in b["lines"]:
                for s in l["spans"]:
                    text = s['text'].strip()
                    y0_norm = s['bbox'][1] / page.rect.height
                    if (y0_norm < 0.1 or y0_norm > 0.9) and text.isdigit():
                        has_page_num = True
                        break
        
        if not has_page_num and page_num > 2: # Skip title pages
            issues.append({
                "type": "Missing Page Number",
                "page": page_num + 1,
                "description": "No page number detected in header or footer.",
                "severity": "low"
            })
            
        # 4. TOC Check (Basic)
        # Look for "Table of Contents" and dot leaders "...."
        page_text = page.get_text("text").lower()
        if "table of contents" in page_text and "..." not in page_text:
             issues.append({
                "type": "TOC Formatting",
                "page": page_num + 1,
                "description": "TOC found but missing dot leaders or page numbers.",
                "severity": "low"
            })

    return {
        "filename": filename,
        "total_pages": len(doc),
        "issues_found": len(issues),
        "issues": issues
    }

@app.post("/api/analyze")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        return {"error": "File must be a PDF"}
        
    contents = await file.read()
    results = analyze_pdf(contents, file.filename)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
