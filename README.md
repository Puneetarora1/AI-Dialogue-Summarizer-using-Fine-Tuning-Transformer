
# 📝 Dialogue Text Summarization using Fine-Tuned T5

## 📌 Project Overview

- This project fine-tunes the pretrained T5 Transformer model on dialogue-summary dataset. 
- The trained model generates summaries from user-provided conversations through a FastAPI endpoint and an interactive web interface.

## 🎯 Objectives

- Automate dialogue summarization using Transformer-based NLP.
- Fine-tune a pretrained T5 model on conversational data.
- Apply text cleaning and tokenization for model training.
- Deploy the trained model through a REST API and web UI.

## 📊 Dataset

- **Dataset:** Samsum
- **Source:** Hugging Face
- **Content:** Conversations paired with human-written summaries.
- **Training Data:** 4,000 randomly sampled dialogues.
- **Validation Data:** 500 randomly sampled dialogues.
- **Preprocessing:** Text cleaning, whitespace normalization, HTML tag removal, and lowercase conversion.

## ⚙️ Tech Stack

- **Language:** Python
- **Data Processing:** Pandas, Regular Expressions
- **NLP & Transformers:** Hugging Face Transformers, T5, T5Tokenizer
- **Deep Learning:** PyTorch
- **Model Training:** Hugging Face Trainer, TrainingArguments
- **Backend:** FastAPI, Pydantic
- **Version Control:** Git, GitHub

## 🔄 Workflow

1. Load dialogue-summary data from the SAMSum dataset.
2. Clean and preprocess dialogue and summary text.
3. Tokenize inputs and target summaries using `T5Tokenizer`.
4. Fine-tune the pretrained `T5ForConditionalGeneration` model for 6 epochs.
5. Save the trained model and tokenizer for inference.
6. Build a FastAPI application with a `/summarize/` endpoint and web interface.

## ✨ Key Features

- Transformer-based dialogue summarization.
- Fine-tuning of a pretrained T5 model.
- Text preprocessing and tokenization pipeline.


  
---

