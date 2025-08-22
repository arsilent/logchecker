// Global variables
let loadedFiles = [];
let searchResults = [];
let filteredSearchResults = [];
let comboResults = [];
let filteredComboResults = [];
let uniqueComboResults = [];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const progressDetails = document.getElementById('progressDetails');

// File Search Elements
const searchFileInput = document.getElementById('searchFileInput');
const searchFileUpload = document.getElementById('searchFileUpload');
const searchBtn = document.getElementById('searchBtn');
const searchTerm = document.getElementById('searchTerm');
const maxResults = document.getElementById('maxResults');
const searchResultsSection = document.getElementById('searchResults');
const searchResultsContent = document.getElementById('searchResultsContent');
const searchResultsCount = document.getElementById('searchResultsCount');
const downloadSearchResults = document.getElementById('downloadSearchResults');
const uploadedFiles = document.getElementById('uploadedFiles');
const fileList = document.getElementById('fileList');
const totalFiles = document.getElementById('totalFiles');
const totalSize = document.getElementById('totalSize');
const totalLinesCount = document.getElementById('totalLinesCount');
const clearFilesBtn = document.getElementById('clearFilesBtn');

// Combo Extractor Elements
const comboFileInput = document.getElementById('comboFileInput');
const comboFileUpload = document.getElementById('comboFileUpload');
const comboTextInput = document.getElementById('comboTextInput');
const extractBtn = document.getElementById('extractBtn');
const totalLines = document.getElementById('totalLines');
const extractedCombos = document.getElementById('extractedCombos');
const successRate = document.getElementById('successRate');
const comboResultsSection = document.getElementById('comboResults');
const comboResultsContent = document.getElementById('comboResultsContent');
const downloadComboResults = document.getElementById('downloadComboResults');
const comboFilterInput = document.getElementById('comboFilterInput');
const clearFilterBtn = document.getElementById('clearFilterBtn');
const filteredCount = document.getElementById('filteredCount');
const totalComboCount = document.getElementById('totalComboCount');

// Search Filter Elements
const searchFilterInput = document.getElementById('searchFilterInput');
const clearSearchFilterBtn = document.getElementById('clearSearchFilterBtn');
const searchFilteredCount = document.getElementById('searchFilteredCount');
const searchFilteredNumber = document.getElementById('searchFilteredNumber');



// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // File Search Events
    searchFileUpload.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        searchFileInput.click();
    });
    searchFileInput.addEventListener('change', handleSearchFileSelect);
    searchFileInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    searchFileUpload.addEventListener('dragover', handleDragOver);
    searchFileUpload.addEventListener('drop', handleSearchFileDrop);
    searchFileUpload.addEventListener('dragleave', handleDragLeave);
    searchBtn.addEventListener('click', performSearch);
    searchTerm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    downloadSearchResults.addEventListener('click', downloadSearchResultsFile);

    // Combo Extractor Events
    comboFileUpload.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        comboFileInput.click();
    });
    comboFileInput.addEventListener('change', handleComboFileSelect);
    comboFileInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    comboFileUpload.addEventListener('dragover', handleDragOver);
    comboFileUpload.addEventListener('drop', handleComboFileDrop);
    comboFileUpload.addEventListener('dragleave', handleDragLeave);
    extractBtn.addEventListener('click', performComboExtraction);
    downloadComboResults.addEventListener('click', downloadComboResultsFile);
    
    // Filter Events
    comboFilterInput.addEventListener('input', filterComboResults);
    clearFilterBtn.addEventListener('click', clearComboFilter);
    searchFilterInput.addEventListener('input', filterSearchResults);
    clearSearchFilterBtn.addEventListener('click', clearSearchFilter);
    clearFilesBtn.addEventListener('click', clearAllFiles);
}

// Tab switching functionality
function switchTab(tabId) {
    // Update tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Update tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleSearchFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    processSearchFiles(files);
}

function handleComboFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        processComboFile(files[0]);
    }
}

// File selection handlers
function handleSearchFileSelect(e) {
    const files = Array.from(e.target.files);
    processSearchFiles(files);
}

function handleComboFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        processComboFile(files[0]);
    }
}

// Process search files
async function processSearchFiles(files) {
    showLoadingWithProgress('Dosyalar yükleniyor...');
    
    try {
        let processedFiles = 0;
        const totalFiles = files.length;
        
        for (const file of files) {
            try {
                const content = await readFileContent(file);
                const lines = content.split('\n');
                
                loadedFiles.push({
                    name: file.name,
                    size: file.size,
                    content: content,
                    lines: lines,
                    lastModified: file.lastModified
                });
                
                processedFiles++;
                
                // Update progress
                const progress = Math.floor((processedFiles / totalFiles) * 100);
                updateProgress(progress, processedFiles, totalFiles);
                
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 10));
                
            } catch (fileError) {
                console.error(`Error processing file ${file.name}:`, fileError);
                alert(`${file.name} dosyası işlenirken hata oluştu. Bu dosya atlandı.`);
            }
        }
        
        updateSearchFileDisplay();
        hideLoading();
    } catch (error) {
        console.error('Error processing files:', error);
        alert('Dosyalar işlenirken bir hata oluştu.');
        hideLoading();
    }
}

// Process combo file
async function processComboFile(file) {
    showLoading();
    try {
        const content = await readFileContent(file);
        comboTextInput.value = content;
        hideLoading();
    } catch (error) {
        console.error('Error processing combo file:', error);
        alert('Combo dosyası işlenirken bir hata oluştu.');
        hideLoading();
    }
}

// Read file content with better error handling
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                resolve(e.target.result);
            } catch (error) {
                reject(new Error(`Dosya okuma hatası: ${error.message}`));
            }
        };
        
        reader.onerror = (e) => {
            reject(new Error(`Dosya yükleme hatası: ${file.name}`));
        };
        
        reader.onabort = (e) => {
            reject(new Error(`Dosya yükleme iptal edildi: ${file.name}`));
        };
        
        // Handle large files with progress
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                // Could show individual file progress here
            }
        };
        
        reader.readAsText(file, 'UTF-8');
    });
}

// Update search file display
function updateSearchFileDisplay() {
    if (loadedFiles.length === 0) {
        uploadedFiles.style.display = 'none';
        searchFileUpload.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Dosyaları sürükleyin veya seçmek için tıklayın</p>
            <small>İstediğiniz kadar dosya yükleyebilirsiniz (.txt, .log, .csv)</small>
        `;
        return;
    }

    // Update upload area
    searchFileUpload.innerHTML = `
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        <p>${loadedFiles.length} dosya yüklendi</p>
        <small>Daha fazla dosya eklemek için tıklayın veya sürükleyin</small>
    `;

    // Show uploaded files section
    uploadedFiles.style.display = 'block';
    
    // Update file list
    fileList.innerHTML = '';
    loadedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileList.appendChild(fileItem);
    });

    // Update stats
    const totalFilesCount = loadedFiles.length;
    const totalSizeBytes = loadedFiles.reduce((sum, file) => sum + file.size, 0);
    const totalLinesTotal = loadedFiles.reduce((sum, file) => sum + file.lines.length, 0);

    totalFiles.textContent = totalFilesCount;
    totalSize.textContent = formatFileSize(totalSizeBytes);
    totalLinesCount.textContent = totalLinesTotal.toLocaleString();
}

// Perform search
async function performSearch() {
    const term = searchTerm.value.trim();
    if (!term) {
        alert('Lütfen arama terimi girin.');
        return;
    }

    if (loadedFiles.length === 0) {
        alert('Lütfen önce dosya yükleyin.');
        return;
    }

    showLoadingWithProgress('Dosyalar aranıyor...');

    try {
        searchResults = [];
        const maxResultsValue = maxResults.value === 'unlimited' ? Infinity : parseInt(maxResults.value);
        let foundCount = 0;
        
        // Calculate total lines for progress
        const totalLines = loadedFiles.reduce((sum, file) => sum + file.lines.length, 0);
        let processedLines = 0;
        
        const searchTermLower = term.toLowerCase();
        const chunkSize = Math.max(100, Math.floor(totalLines / 100)); // Dynamic chunk size

        for (const file of loadedFiles) {
            if (foundCount >= maxResultsValue) break;
            
            // Process file in chunks
            for (let startIndex = 0; startIndex < file.lines.length; startIndex += chunkSize) {
                if (foundCount >= maxResultsValue) break;
                
                const endIndex = Math.min(startIndex + chunkSize, file.lines.length);
                
                // Process chunk
                for (let i = startIndex; i < endIndex && foundCount < maxResultsValue; i++) {
                    const line = file.lines[i];
                    if (line.toLowerCase().includes(searchTermLower)) {
                        searchResults.push({
                            file: file.name,
                            lineNumber: i + 1,
                            content: line.trim()
                        });
                        foundCount++;
                    }
                }
                
                processedLines += (endIndex - startIndex);
                
                // Update progress
                const progress = Math.floor((processedLines / totalLines) * 100);
                updateProgress(progress, processedLines, totalLines);
                
                // Allow UI to update - adaptive delay based on total size
                const delay = totalLines > 100000 ? 5 : totalLines > 50000 ? 3 : 1;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        displaySearchResults();
        hideLoading();
    } catch (error) {
        console.error('Search error:', error);
        alert('Arama sırasında bir hata oluştu.');
        hideLoading();
    }
}

// Display search results
function displaySearchResults() {
    filteredSearchResults = [...searchResults];
    
    if (searchResults.length === 0) {
        searchResultsContent.textContent = 'Arama terimi bulunamadı.';
    } else {
        const resultsText = filteredSearchResults.map(result => 
            `[${result.file}:${result.lineNumber}] ${result.content}`
        ).join('\n');
        searchResultsContent.textContent = resultsText;
    }

    searchResultsCount.textContent = `${searchResults.length.toLocaleString()} sonuç bulundu`;
    updateSearchFilterStats();
    searchResultsSection.style.display = 'block';
}

// Download search results
function downloadSearchResultsFile() {
    const resultsToDownload = filteredSearchResults.length > 0 ? filteredSearchResults : searchResults;
    
    if (resultsToDownload.length === 0) {
        alert('İndirilecek sonuç bulunamadı.');
        return;
    }

    const content = resultsToDownload.map(result => 
        `[${result.file}:${result.lineNumber}] ${result.content}`
    ).join('\n');

    const isFiltered = filteredSearchResults.length !== searchResults.length;
    const filename = `search_results${isFiltered ? '_filtered' : ''}.txt`;

    downloadFile(content, filename, 'text/plain');
}

// Perform combo extraction
async function performComboExtraction() {
    const content = comboTextInput.value.trim();
    if (!content) {
        alert('Lütfen combo verisi girin veya dosya yükleyin.');
        return;
    }

    showLoadingWithProgress('Combolar ayıklanıyor...');

    try {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        const selectedFormat = document.querySelector('input[name="format"]:checked').value;
        
        comboResults = [];
        const comboSet = new Set(); // For duplicate detection
        
        // Dynamic chunk size based on total lines
        const totalLines = lines.length;
        const chunkSize = Math.max(50, Math.floor(totalLines / 100)); // Smaller chunks for better progress
        let processedLines = 0;

        for (let i = 0; i < lines.length; i += chunkSize) {
            const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length));
            
            // Process each line in the chunk
            for (const line of chunk) {
                const extracted = extractComboFromLine(line, selectedFormat);
                if (extracted) {
                    // Check for duplicates
                    const normalizedCombo = extracted.toLowerCase().trim();
                    if (!comboSet.has(normalizedCombo)) {
                        comboSet.add(normalizedCombo);
                        comboResults.push(extracted);
                    }
                }
            }
            
            processedLines += chunk.length;
            
            // Update progress
            const progress = Math.floor((processedLines / totalLines) * 100);
            updateProgress(progress, processedLines, totalLines);
            updateComboStats(totalLines, comboResults.length);
            
            // Allow UI to update - adaptive delay based on file size
            const delay = totalLines > 100000 ? 10 : totalLines > 50000 ? 5 : 2;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Store unique results
        uniqueComboResults = [...comboResults];

        displayComboResults();
        hideLoading();
    } catch (error) {
        console.error('Combo extraction error:', error);
        alert('Combo ayıklama sırasında bir hata oluştu.');
        hideLoading();
    }
}

// Extract combo from line based on format
function extractComboFromLine(line, format) {
    if (!line || line.trim().length === 0) return null;
    
    // Remove file info brackets if present (e.g., [filename:linenumber])
    let cleanLine = line.replace(/^\[.*?\]\s*/, '').trim();
    
    if (!cleanLine) return null;
    
    // More comprehensive separator handling
    cleanLine = cleanLine.replace(/[|;,\t\s]+/g, ':');
    
    // Extract URLs, emails, and potential passwords using improved regex
    const urlRegex = /https?:\/\/[^\s:;|,\t]+/gi;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    
    const urls = cleanLine.match(urlRegex) || [];
    const emails = cleanLine.match(emailRegex) || [];
    
    // Split by separators and clean empty parts
    const allParts = cleanLine.split(/[:]+/).filter(part => {
        const trimmed = part.trim();
        return trimmed.length > 0 && !trimmed.match(/^\[.*\]$/);
    });
    
    if (allParts.length < 2) return null;
    
    // Find potential passwords - more robust detection
    let passwords = [];
    for (const part of allParts) {
        const trimmed = part.trim();
        if (trimmed.length >= 2 && 
            !isValidUrl(trimmed) && 
            !isValidEmail(trimmed) && 
            !trimmed.match(/^\[.*\]$/) && // Not bracket content
            !trimmed.match(/^(http|https|www|com|org|net|edu|gov)$/i) && // Not common web terms
            trimmed.match(/^[A-Za-z0-9@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?!~`]+$/)) {
            passwords.push(trimmed);
        }
    }

    switch (format) {
        case 'URL:PASS':
            // Try exact URL matches first
            if (urls.length > 0) {
                const urlPart = urls[0];
                // Find password after URL
                const urlIndex = allParts.findIndex(part => part.includes(urlPart.replace('https://', '').replace('http://', '')));
                if (urlIndex >= 0 && urlIndex < allParts.length - 1) {
                    return `${urlPart}:${allParts[urlIndex + 1].trim()}`;
                }
                // Fallback to last password
                if (passwords.length > 0) {
                    return `${urlPart}:${passwords[passwords.length - 1]}`;
                }
            }
            
            // Fallback: look for domain-like patterns
            for (let i = 0; i < allParts.length - 1; i++) {
                const part = allParts[i].trim();
                if (isValidUrl(part) || isDomainLike(part)) {
                    return `${part}:${allParts[i + 1].trim()}`;
                }
            }
            break;
            
        case 'MAIL:PASS':
            // Try exact email matches first
            if (emails.length > 0) {
                const emailPart = emails[0];
                // Find password after email
                const emailIndex = allParts.findIndex(part => part.includes(emailPart));
                if (emailIndex >= 0 && emailIndex < allParts.length - 1) {
                    return `${emailPart}:${allParts[emailIndex + 1].trim()}`;
                }
                // Fallback to last password
                if (passwords.length > 0) {
                    return `${emailPart}:${passwords[passwords.length - 1]}`;
                }
            }
            
            // Fallback: look for email patterns
            for (let i = 0; i < allParts.length - 1; i++) {
                const part = allParts[i].trim();
                if (isValidEmail(part)) {
                    return `${part}:${allParts[i + 1].trim()}`;
                }
            }
            break;
            
        case 'USERNAME:PASS':
        case 'USER:PASS':
            // Look for username patterns (not URL or email)
            for (let i = 0; i < allParts.length - 1; i++) {
                const part = allParts[i].trim();
                if (!isValidUrl(part) && !isValidEmail(part) && part.length >= 2) {
                    return `${part}:${allParts[i + 1].trim()}`;
                }
            }
            break;
            
        case 'URL:MAIL:PASS':
            let foundUrl = null, foundEmail = null, foundPassword = null;
            
            // First pass: find exact matches
            if (urls.length > 0) foundUrl = urls[0];
            if (emails.length > 0) foundEmail = emails[0];
            if (passwords.length > 0) foundPassword = passwords[passwords.length - 1];
            
            // Second pass: find in order from parts
            if (!foundUrl || !foundEmail || !foundPassword) {
                for (const part of allParts) {
                    const trimmed = part.trim();
                    if (!foundUrl && (isValidUrl(trimmed) || isDomainLike(trimmed))) {
                        foundUrl = trimmed;
                    } else if (!foundEmail && isValidEmail(trimmed)) {
                        foundEmail = trimmed;
                    } else if (!foundPassword && trimmed.length >= 2 && 
                              !isValidUrl(trimmed) && !isValidEmail(trimmed)) {
                        foundPassword = trimmed;
                    }
                }
            }
            
            if (foundUrl && foundEmail && foundPassword) {
                return `${foundUrl}:${foundEmail}:${foundPassword}`;
            }
            break;
    }
    return null;
}

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        // Check if it's a domain without protocol
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        return domainRegex.test(url) || url.includes('.');
    }
}

// Check if string looks like a domain (for URL matching)
function isDomainLike(str) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
    return domainRegex.test(str) && str.includes('.');
}

// Update combo statistics
function updateComboStats(total, extracted) {
    totalLines.textContent = total.toLocaleString();
    extractedCombos.textContent = extracted.toLocaleString();
    const rate = total > 0 ? ((extracted / total) * 100).toFixed(1) : 0;
    successRate.textContent = `${rate}%`;
}

// Display combo results
function displayComboResults() {
    filteredComboResults = [...comboResults];
    
    if (comboResults.length === 0) {
        comboResultsContent.textContent = 'Seçilen formatta combo bulunamadı.';
    } else {
        // Show first 1000 results to prevent browser freeze
        const displayResults = filteredComboResults.slice(0, 1000);
        comboResultsContent.textContent = displayResults.join('\n');
        
        if (filteredComboResults.length > 1000) {
            comboResultsContent.textContent += `\n\n... ve ${(filteredComboResults.length - 1000).toLocaleString()} combo daha (tümünü indirmek için "Sonuçları İndir" butonunu kullanın)`;
        }
    }

    updateComboFilterStats();
    comboResultsSection.style.display = 'block';
    downloadComboResults.style.display = comboResults.length > 0 ? 'inline-flex' : 'none';
}

// Download combo results
function downloadComboResultsFile() {
    const resultsToDownload = filteredComboResults.length > 0 ? filteredComboResults : comboResults;
    
    if (resultsToDownload.length === 0) {
        alert('İndirilecek combo bulunamadı.');
        return;
    }

    const content = resultsToDownload.join('\n');
    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    const isFiltered = filteredComboResults.length !== comboResults.length;
    const filename = `extracted_combos_${selectedFormat.replace(/:/g, '_').toLowerCase()}${isFiltered ? '_filtered' : ''}.txt`;
    
    downloadFile(content, filename, 'text/plain');
}

// Generic download function
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Loading overlay functions
function showLoading() {
    loadingText.textContent = 'İşleniyor...';
    progressContainer.style.display = 'none';
    loadingOverlay.style.display = 'flex';
}

function showLoadingWithProgress(text) {
    loadingText.textContent = text;
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    progressDetails.textContent = '0 / 0 işlendi';
    loadingOverlay.style.display = 'flex';
}

function updateProgress(percentage, processed, total) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
    progressDetails.textContent = `${processed.toLocaleString()} / ${total.toLocaleString()} işlendi`;
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
    progressContainer.style.display = 'none';
}

// Filter Functions
function filterComboResults() {
    const filterTerm = comboFilterInput.value.toLowerCase().trim();
    
    if (!filterTerm) {
        filteredComboResults = [...comboResults];
    } else {
        filteredComboResults = comboResults.filter(combo => 
            combo.toLowerCase().includes(filterTerm)
        );
    }
    
    displayFilteredComboResults();
    updateComboFilterStats();
}

function clearComboFilter() {
    comboFilterInput.value = '';
    filteredComboResults = [...comboResults];
    displayFilteredComboResults();
    updateComboFilterStats();
}

function filterSearchResults() {
    const filterTerm = searchFilterInput.value.toLowerCase().trim();
    
    if (!filterTerm) {
        filteredSearchResults = [...searchResults];
    } else {
        filteredSearchResults = searchResults.filter(result => 
            result.content.toLowerCase().includes(filterTerm) ||
            result.file.toLowerCase().includes(filterTerm)
        );
    }
    
    displayFilteredSearchResults();
    updateSearchFilterStats();
}

function clearSearchFilter() {
    searchFilterInput.value = '';
    filteredSearchResults = [...searchResults];
    displayFilteredSearchResults();
    updateSearchFilterStats();
}

function displayFilteredComboResults() {
    if (filteredComboResults.length === 0) {
        comboResultsContent.textContent = comboResults.length === 0 ? 
            'Seçilen formatta combo bulunamadı.' : 
            'Filtre ile eşleşen combo bulunamadı.';
    } else {
        // Show first 1000 results to prevent browser freeze
        const displayResults = filteredComboResults.slice(0, 1000);
        comboResultsContent.textContent = displayResults.join('\n');
        
        if (filteredComboResults.length > 1000) {
            comboResultsContent.textContent += `\n\n... ve ${(filteredComboResults.length - 1000).toLocaleString()} combo daha (tümünü indirmek için "Sonuçları İndir" butonunu kullanın)`;
        }
    }
}

function displayFilteredSearchResults() {
    if (filteredSearchResults.length === 0) {
        searchResultsContent.textContent = searchResults.length === 0 ? 
            'Arama terimi bulunamadı.' : 
            'Filtre ile eşleşen sonuç bulunamadı.';
    } else {
        const resultsText = filteredSearchResults.map(result => 
            `[${result.file}:${result.lineNumber}] ${result.content}`
        ).join('\n');
        searchResultsContent.textContent = resultsText;
    }
}

function updateComboFilterStats() {
    filteredCount.textContent = filteredComboResults.length.toLocaleString();
    totalComboCount.textContent = comboResults.length.toLocaleString();
}

function updateSearchFilterStats() {
    if (filteredSearchResults.length !== searchResults.length) {
        searchFilteredCount.style.display = 'inline';
        searchFilteredNumber.textContent = filteredSearchResults.length.toLocaleString();
    } else {
        searchFilteredCount.style.display = 'none';
    }
}

// Create file item element
function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileExtension = file.name.split('.').pop().toUpperCase();
    const fileIcon = getFileIcon(fileExtension);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon">${fileIcon}</div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    ${formatFileSize(file.size)} • ${file.lines.length.toLocaleString()} satır • ${new Date(file.lastModified).toLocaleDateString('tr-TR')}
                </div>
            </div>
        </div>
        <button class="file-remove" onclick="removeFile(${index})" title="Dosyayı kaldır">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return fileItem;
}

// Get file icon based on extension
function getFileIcon(extension) {
    switch (extension.toLowerCase()) {
        case 'txt': return '<i class="fas fa-file-alt"></i>';
        case 'log': return '<i class="fas fa-file-code"></i>';
        case 'csv': return '<i class="fas fa-file-csv"></i>';
        default: return '<i class="fas fa-file"></i>';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Remove specific file
function removeFile(index) {
    loadedFiles.splice(index, 1);
    updateSearchFileDisplay();
    
    // Clear results if no files left
    if (loadedFiles.length === 0) {
        searchResultsSection.style.display = 'none';
        searchResults = [];
        filteredSearchResults = [];
    }
}

// Clear all files
function clearAllFiles() {
    loadedFiles = [];
    searchResults = [];
    filteredSearchResults = [];
    updateSearchFileDisplay();
    searchResultsSection.style.display = 'none';
    
    // Reset file input
    searchFileInput.value = '';
}



// Performance optimization: Use Web Workers for large file processing
function processLargeFileInWorker(content, callback) {
    // This could be implemented with Web Workers for even better performance
    // For now, we use setTimeout to prevent UI blocking
    setTimeout(() => {
        callback(content);
    }, 10);
} 