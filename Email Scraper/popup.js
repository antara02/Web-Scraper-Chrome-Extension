let scrapeEmails = document.getElementById('scrapeEmails');
let list = document.getElementById('emailList');
let downloadButton = document.getElementById('downloadButton');
let previewContainer = document.getElementById('previewContainer');

// Receive emails from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Get emails
    let uniqueEmails = request.emails;

    // Clear previous emails and preview
    list.innerHTML = '';
    previewContainer.innerHTML = '';

    // No emails
    if (uniqueEmails == null || uniqueEmails.length == 0) {
        let li = document.createElement('li');
        li.innerText = 'No emails found here!';
        list.appendChild(li);
        downloadButton.style.display = 'none'; // Hide download button
        previewContainer.style.display = 'none'; // Hide email preview
    }
    // Display emails
    else {
        uniqueEmails.forEach((email) => {
            let li = document.createElement('li');
            li.innerText = email;
            list.appendChild(li);
        });
        downloadButton.style.display = 'block'; // Show download button
        previewContainer.style.display = 'block'; // Show email preview
    }
});

// Button click event listener
scrapeEmails.addEventListener('click', async () => {
    // Get current active tab
    let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    // Parse emails on page by scripting
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeEmailsFromPage,
    });
});

// Function scrapeEmailsFromPage to scrape emails
function scrapeEmailsFromPage() {
    // RegEx for parsing emails from HTML code
    const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;

    // Parsing emails from HTML of the page
    let emails = document.body.innerHTML.match(emailRegEx);

    // Sending emails to popup
    const uniqueEmails = [...new Set(emails)];

    // Sending unique emails to the popup
    chrome.runtime.sendMessage({ emails: uniqueEmails });
}

// Download button click event listener
downloadButton.addEventListener('click', () => {
    // Create a CSV file with the scraped emails
    let csvContent = 'data:text/csv;charset=utf-8,';
    list.querySelectorAll('li').forEach((li) => {
        csvContent += li.innerText + '\n';
    });

    // Create a download link and trigger the download
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'scraped_emails.csv');
    document.body.appendChild(link);
    link.click();
});
