Brain Tumor Segmentation using 3D U-Net

A modern web application for AI-assisted brain tumor segmentation from multi-modal MRI scans using a 3D U-Net model trained on the BraTS 2021 dataset. The application provides an intuitive interface for uploading MRI scans, visualizing segmentation outputs across multiple MRI modalities, analyzing tumor regions, and downloading clinical-style reports.

Note: This project is intended for research and educational purposes only and is not approved for clinical diagnosis.

⸻

Features

* Multi-modal MRI upload (FLAIR, T1, T1CE, T2)
* AI-powered brain tumor segmentation
* Visualization of:
    * FLAIR MRI
    * T1 MRI
    * T1CE MRI
    * T2 MRI
    * Segmentation Mask
    * Overlay Image
* Tumor voxel statistics
* Prediction confidence visualization
* Clinical-style summary
* Download segmentation mask
* Export inference results as JSON
* Clean, responsive dark-themed interface

⸻

Demo

Live Demo: (Add your Vercel URL here)

Hugging Face Model: (Add your Hugging Face Space URL here)

⸻

Tech Stack

Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* TanStack Router
* Lucide React

AI Backend

* PyTorch
* MONAI
* Gradio
* Hugging Face Spaces

Dataset

* BraTS 2021 Dataset

⸻

Project Structure
src/
├── components/
│   ├── site-header.tsx
│   └── ui/
│
├── hooks/
│
├── lib/
│   ├── analysis-store.tsx
│   ├── hf-inference.functions.ts
│   └── utils.ts
│
├── routes/
│   ├── index.tsx
│   ├── upload.tsx
│   ├── processing.tsx
│   ├── results.tsx
│   └── __root.tsx
│
├── styles.css
└── main.tsx
Model Information

* Architecture: 3D U-Net
* Framework: MONAI
* Dataset: BraTS 2021
* Inference: Hugging Face Spaces

Input Requirements

Upload the following MRI modalities for a single patient:

* FLAIR
* T1
* T1CE
* T2
Supported format:
.nii.gz
Author

Aditya Anand

B.Tech Information Technology
Dr. B.R. Ambedkar National Institute of Technology (NIT Jalandhar)
