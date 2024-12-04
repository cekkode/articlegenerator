document.getElementById('turnPdfButton').addEventListener('click', async () => {
    const printfriendlyApiKey = document.getElementById('printfriendlyApiKey').value;
    const googleDriveApiKey = document.getElementById('googleDriveApiKey').value;
    const urls = document.getElementById('urls').value.split('\n');
    const status = document.getElementById('status');
    status.innerHTML = '';

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const folderName = `pdf_${timestamp}`;

    try {
        const folderId = await createGoogleDriveFolder(googleDriveApiKey, folderName);
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            status.innerHTML = `Processing: ${url} (${i + 1}/${urls.length})<br>`;
            const pdfUrl = await createPdf(printfriendlyApiKey, url);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Respecting rate limit
            await uploadToGoogleDrive(googleDriveApiKey, folderId, pdfUrl, url);
            status.innerHTML += `Successfully uploaded: ${url}<br>`;
        }
        status.innerHTML += `All files processed successfully!`;
    } catch (error) {
        status.innerHTML = `Error: ${error.message}`;
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

async function createGoogleDriveFolder(apiKey, folderName) {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
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
    
    const uploadResponse = await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=media`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/pdf',
            'Content-Length': fileBlob.size
        },
        body: fileBlob
    });
    const fileData = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error('Failed to upload file');
    
    // Move file to the created folder
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}`, {
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