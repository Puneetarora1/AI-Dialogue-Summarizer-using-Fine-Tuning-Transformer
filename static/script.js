"use strict";

// FastAPI endpoint
const API_URL = "/summarize/";
const REQUEST_TIMEOUT = 120000;

// DOM elements
const dialogueInput = document.getElementById("dialogue");
const wordCount = document.getElementById("wordCount");

const summarizeButton = document.getElementById("summarizeButton");
const buttonText = document.getElementById("buttonText");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const summaryOutput = document.getElementById("summaryOutput");
const resultFooter = document.getElementById("resultFooter");
const summaryStats = document.getElementById("summaryStats");

const inputError = document.getElementById("inputError");
const apiError = document.getElementById("apiError");
const successMessage = document.getElementById("successMessage");

let currentSummary = "";
let requestInProgress = false;

// Count words
function countWords(text) {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Update input statistics
function updateWordCount() {
    const text = dialogueInput.value;

    wordCount.textContent =
        `${countWords(text)} words · ${text.length} characters`;
}

// Display messages safely
function showMessage(element, message) {
    element.textContent = message;
    element.hidden = false;
}

function hideMessage(element) {
    element.textContent = "";
    element.hidden = true;
}

function clearMessages() {
    hideMessage(inputError);
    hideMessage(apiError);
    hideMessage(successMessage);
}

// Reset the result panel
function resetResult() {
    currentSummary = "";

    summaryOutput.textContent = "";
    summaryOutput.hidden = true;

    resultFooter.hidden = true;
    copyButton.disabled = true;

    loadingState.hidden = true;
    emptyState.hidden = false;
}

// Toggle loading state
function setLoading(isLoading) {
    requestInProgress = isLoading;

    summarizeButton.disabled = isLoading;
    clearButton.disabled = isLoading;
    dialogueInput.disabled = isLoading;

    buttonText.textContent = isLoading
        ? "Generating..."
        : "Generate Summary";

    if (isLoading) {
        emptyState.hidden = true;
        summaryOutput.hidden = true;
        resultFooter.hidden = true;
        loadingState.hidden = false;

        hideMessage(apiError);
        hideMessage(successMessage);
    } else {
        loadingState.hidden = true;
    }
}

// Display the generated summary
function showSummary(summary) {
    currentSummary = summary;

    // textContent prevents the model output from being interpreted as HTML.
    summaryOutput.textContent = summary;
    summaryOutput.hidden = false;

    emptyState.hidden = true;
    loadingState.hidden = true;
    resultFooter.hidden = false;
    copyButton.disabled = false;

    summaryStats.textContent =
        `${countWords(summary)} words · ${summary.length} characters`;

    summaryOutput.focus();
}

// Extract FastAPI validation errors
function getValidationMessage(data) {
    if (typeof data?.detail === "string") {
        return data.detail;
    }

    if (Array.isArray(data?.detail)) {
        return data.detail.map(error => {
            const field = Array.isArray(error.loc)
                ? error.loc.filter(part => part !== "body").join(" → ")
                : "Input";

            return `${field || "Input"}: ${error.msg || "Invalid value"}`;
        }).join(" | ");
    }

    return "";
}

// Generate summary using FastAPI
async function generateSummary() {
    if (requestInProgress) return;

    clearMessages();

    const dialogue = dialogueInput.value.trim();

    // Client-side validation
    if (!dialogue) {
        showMessage(
            inputError,
            "Please enter a dialogue before generating a summary."
        );

        dialogueInput.focus();
        return;
    }

    if (dialogue.length > 30000) {
        showMessage(
            inputError,
            "Your dialogue is too long. Please shorten it."
        );
        return;
    }

    setLoading(true);

    const controller = new AbortController();

    const timeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT
    );

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ dialogue }),
            signal: controller.signal
        });

        const data = await response.json().catch(() => null);

        // Handle unsuccessful API responses
        if (!response.ok) {
            if (response.status === 422) {
                throw new Error(
                    getValidationMessage(data) ||
                    "Invalid input. Please check your dialogue."
                );
            }

            if (response.status === 429) {
                throw new Error(
                    "Too many requests. Please wait and try again."
                );
            }

            if (response.status >= 500) {
                throw new Error(
                    "The server encountered an error. Please try again."
                );
            }

            throw new Error(
                getValidationMessage(data) ||
                `Request failed with status ${response.status}.`
            );
        }

        // Validate the response format
        if (typeof data?.summary !== "string") {
            throw new Error(
                "Unexpected API response. Please check your backend."
            );
        }

        if (!data.summary.trim()) {
            throw new Error(
                "The model returned an empty summary. Try another dialogue."
            );
        }

        showSummary(data.summary);

    } catch (error) {
        let message;

        if (error.name === "AbortError") {
            message =
                "The request timed out. The model may be loading or processing a long dialogue. Please try again.";
        } else if (error instanceof TypeError) {
            message =
                "Unable to connect to the API. Check that the FastAPI server is running.";
        } else {
            message = error.message ||
                "Something went wrong. Please try again.";
        }

        showMessage(apiError, message);
        emptyState.hidden = true;

    } finally {
        clearTimeout(timeoutId);
        setLoading(false);
    }
}

// Copy summary to clipboard
async function copySummary() {
    if (!currentSummary) return;

    clearMessages();

    try {
        await navigator.clipboard.writeText(currentSummary);

        showMessage(successMessage, "Summary copied to clipboard!");

    } catch {
        // Fallback for browsers without Clipboard API access
        const temporary = document.createElement("textarea");

        temporary.value = currentSummary;
        temporary.setAttribute("readonly", "");
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";

        document.body.appendChild(temporary);
        temporary.select();

        let copied = false;

        try {
            copied = document.execCommand("copy");
        } catch {
            copied = false;
        }

        temporary.remove();

        if (copied) {
            showMessage(successMessage, "Summary copied to clipboard!");
        } else {
            showMessage(
                apiError,
                "Copy failed. Please select and copy the summary manually."
            );
        }
    }
}

// Clear input and reset result
function clearInput() {
    if (requestInProgress) return;

    dialogueInput.value = "";

    updateWordCount();
    clearMessages();
    resetResult();

    dialogueInput.focus();
}

// Event listeners
dialogueInput.addEventListener("input", () => {
    updateWordCount();
    hideMessage(inputError);
});

summarizeButton.addEventListener("click", generateSummary);
clearButton.addEventListener("click", clearInput);
copyButton.addEventListener("click", copySummary);

// Initial setup
updateWordCount();
copyButton.disabled = true;