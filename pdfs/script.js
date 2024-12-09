const scriptVer = '1.5';
console.log("Ver: " + scriptVer);

// Function to validate and parse OAuth credentials
function parseAndValidateOAuthCredentials(credentialsJson) {
  try {
    const credentials = JSON.parse(credentialsJson);

    // Validate required fields
    const requiredFields = ['client_id', 'client_secret', 'redirect_uris', 'auth_uri', 'token_uri'];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return { success: true, credentials };
  } catch (error) {
    console.error(`Invalid OAuth Credentials: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Function to save credentials to localStorage
function saveCredentials() {
  const printfriendlyApiKey = document.getElementById('printfriendlyApiKey').value;
  const googleDriveApiKey = document.getElementById('googleDriveApiKey').value;
  const googleOauthCredentials = document.getElementById('googleOauthCredentials').value;

  // Validate OAuth credentials before saving
  const validationResult = parseAndValidateOAuthCredentials(googleOauthCredentials);

  if (printfriendlyApiKey && googleDriveApiKey && validationResult.success) {
    localStorage.setItem('printfriendlyApiKey', printfriendlyApiKey);
    localStorage.setItem('googleDriveApiKey', googleDriveApiKey);
    localStorage.setItem('googleOauthCredentials', googleOauthCredentials);

    alert('Credentials saved successfully!');
  } else {
    alert(`Failed to save credentials: ${validationResult.error}`);
  }
}

// Function to load saved credentials
function loadSavedCredentials() {
  const printfriendlyApiKey = localStorage.getItem('printfriendlyApiKey');
  const googleDriveApiKey = localStorage.getItem('googleDriveApiKey');
  const googleOauthCredentials = localStorage.getItem('googleOauthCredentials');

  if (printfriendlyApiKey) document.getElementById('printfriendlyApiKey').value = printfriendlyApiKey;
  if (googleDriveApiKey) document.getElementById('googleDriveApiKey').value = googleDriveApiKey;
  if (googleOauthCredentials) document.getElementById('googleOauthCredentials').value = googleOauthCredentials;
}

// Modify the existing script to use stored credentials
document.getElementById('turnPdfButton').addEventListener('click', async () => {
  const printfriendlyApiKey = document.getElementById('printfriendlyApiKey').value;
  const googleDriveApiKey = document.getElementById('googleDriveApiKey').value;
  const googleOauthCredentials = document.getElementById('googleOauthCredentials').value;
  const status = document.getElementById('status');

  // Parse and validate OAuth credentials
  const validationResult = parseAndValidateOAuthCredentials(googleOauthCredentials);
  if (!validationResult.success) {
    status.innerHTML = `Error: ${validationResult.error}`;
    return; // Stop execution if credentials are invalid
  }

  const { client_id, client_secret, redirect_uris, auth_uri, token_uri } = validationResult.credentials;

  const urls = document.getElementById('urls').value.split('\n');
  status.innerHTML = '';

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const folderName = `pdf_${timestamp}`;

  try {
    const folderId = await createGoogleDriveFolder(googleDriveApiKey, folderName, urls[0]); // Pass the first URL for folder naming
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      status.innerHTML += `Processing: ${url} (${i + 1}/${urls.length})<br>`;
      updateProgress(i, urls.length); // Update the progress bar

      const pdfUrl = await createPdf(printfriendlyApiKey, url);
      await new Promise((resolve) => setTimeout(resolve, 1200)); // Respecting rate limit
      await uploadToGoogleDrive(googleDriveApiKey, folderId, pdfUrl, url);
      status.innerHTML += `Successfully uploaded: ${url}<br>`;
    }
    status.innerHTML += `All files processed successfully!`;
    toggleCancelButton(false);
    resetProgress();
  } catch (error) {
    status.innerHTML = `Error: ${error.message}`;
    toggleCancelButton(false);
    resetProgress();
  }
});

async function createPdf(apiKey, url) {
  const response = await fetch(`https://api.printfriendly.com/v2/pdf/create?api_key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
    body: new URLSearchParams({ page_url: url, output_type: 'attachment' })
  });
  const data = await response.json();
  if (data.status !== 'success') throw new Error('Failed to create PDF');
  return data.file_url;
}

function extractSitename(url) {
  try {
    const parsedUrl = new URL(url);
    // Remove www. and take the hostname
    return parsedUrl.hostname.replace('www.', '').replace(/\./g, '-');
  } catch (error) {
    // Fallback to timestamp if URL is invalid
    return `pdf_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
  }
}

async function createGoogleDriveFolder(apiKey, folderName, firstUrl) {
  // Use the first URL to generate a more specific folder name
  const siteName = extractSitename(firstUrl); // Use the first URL for a more descriptive name
  const dynamicFolderName = `pdf-${siteName}`;

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: dynamicFolderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error('Failed to create folder');
  return data.id;
}

async function uploadToGoogleDrive(apiKey, folderId, fileUrl, originalUrl) {
  const fileName = originalUrl.replace(/\.|\//g, '-') + '.pdf';
  const response = await fetch(fileUrl);
  const fileBlob = await response.blob();

  const uploadResponse = await retryWithBackoff(async () => {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/pdf',
        'Content-Length': fileBlob.size
      },
      body: fileBlob
    });
    if (!res.ok) throw new Error(`Failed to upload file: ${res.status} - ${res.statusText}`);
    return await res.json();
  });

  // Move file to the created folder
  await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResponse.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: fileName,
      parents: [folderId]
    })
  });
}

const progressIndicator = document.getElementById('progress-indicator');
const progressBar = document.getElementById('progress-bar');

// Update the progress bar during file processing
const updateProgress = (currentIndex, totalFiles) => {
  const progress = (currentIndex / totalFiles) * 100;
  progressIndicator.style.width = `${progress}%`;
};

// Reset the progress bar
const resetProgress = () => {
  progressIndicator.style.width = '0%';
};

const cancelButton = document.getElementById('cancelButton');
let processingActive = false;

// Toggle the cancel button visibility and processing state
const toggleCancelButton = (visible) => {
  cancelButton.style.display = visible ? 'inline' : 'none';
  processingActive = visible;
};

// Add click handler for the cancel button
cancelButton.addEventListener('click', () => {
  toggleCancelButton(false);
  status.innerHTML = 'Processing cancelled.';
  resetProgress();
});

async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      status.innerHTML += `Retry attempt ${retries}/${maxRetries} - ${error.message}<br>`;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error('Maximum retries reached. Unable to complete the operation.');
}

// Load saved credentials when the page loads
document.addEventListener('DOMContentLoaded', loadSavedCredentials);

// Add event listeners to save credentials after input
document.getElementById('printfriendlyApiKey').addEventListener('change', saveCredentials);
document.getElementById('googleDriveApiKey').addEventListener('change', saveCredentials);
document.getElementById('googleOauthCredentials').addEventListener('change', saveCredentials);