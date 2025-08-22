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
const useAI = document.getElementById('useAI');

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

// Perform combo extraction with AI or local method
async function performComboExtraction() {
    const content = comboTextInput.value.trim();
    if (!content) {
        alert('Lütfen combo verisi girin veya dosya yükleyin.');
        return;
    }

    const selectedFormat = document.querySelector('input[name="format"]:checked').value;
    const useAIExtraction = useAI.checked;
    
    if (useAIExtraction) {
        showLoadingWithProgress('AI ile combolar ayıklanıyor...');
    } else {
        showLoadingWithProgress('Combolar ayıklanıyor...');
    }

    try {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        const totalLines = lines.length;
        
        comboResults = [];
        const comboSet = new Set(); // For duplicate detection
        
        if (useAIExtraction) {
            // AI-powered extraction
            const chunkSize = Math.min(15, Math.max(5, Math.floor(totalLines / 40))); // Even smaller chunks for better accuracy
            let processedLines = 0;

            for (let i = 0; i < lines.length; i += chunkSize) {
                const chunk = lines.slice(i, Math.min(i + chunkSize, lines.length));
                
                try {
                    // Call AI API for this chunk
                    const aiResults = await extractComboWithAI(chunk, selectedFormat);
                    
                    // Process AI results
                    if (aiResults && Array.isArray(aiResults)) {
                        for (const extracted of aiResults) {
                            if (extracted && typeof extracted === 'string') {
                                // Check for duplicates
                                const normalizedCombo = extracted.toLowerCase().trim();
                                if (!comboSet.has(normalizedCombo)) {
                                    comboSet.add(normalizedCombo);
                                    comboResults.push(extracted);
                                }
                            }
                        }
                    }
                } catch (apiError) {
                    console.error('AI API error for chunk:', apiError);
                    // Fallback to local extraction for this chunk
                    for (const line of chunk) {
                        const extracted = extractComboFromLine(line, selectedFormat);
                        if (extracted) {
                            const normalizedCombo = extracted.toLowerCase().trim();
                            if (!comboSet.has(normalizedCombo)) {
                                comboSet.add(normalizedCombo);
                                comboResults.push(extracted);
                            }
                        }
                    }
                }
                
                processedLines += chunk.length;
                
                // Update progress
                const progress = Math.floor((processedLines / totalLines) * 100);
                updateProgress(progress, processedLines, totalLines);
                updateComboStats(totalLines, comboResults.length);
                
                // Allow UI to update and prevent API rate limiting
                await new Promise(resolve => setTimeout(resolve, 800)); // 800ms delay for API calls
            }
        } else {
            // Local extraction (original method)
            const chunkSize = Math.max(50, Math.floor(totalLines / 100));
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

// ADVANCED LOCAL COMBO EXTRACTION - NO AI NEEDED
function extractComboFromLine(line, format) {
    if (!line || line.trim().length === 0) return null;
    
    let cleaned = line.trim();
    
    // Agresif satır numarası ve bracket temizleme
    cleaned = cleaned.replace(/^\[\d+\]\s*:?\s*/, ''); // [123456]: 
    cleaned = cleaned.replace(/^\d+\]\s*:?\s*/, ''); // 123456]:
    cleaned = cleaned.replace(/^\d+:\s*/, ''); // 123456:
    cleaned = cleaned.replace(/^\d+\s+/, ''); // 123456 space
    cleaned = cleaned.replace(/^\[.*?\]\s*/, ''); // [anything]
    
    if (!cleaned || cleaned.length < 5) return null;
    if (!cleaned.includes(':')) return null;
    
    const parts = cleaned.split(':').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length < 2) return null;

    switch (format) {
        case 'URL:PASS':
            return extractUrlPass(parts);
            
        case 'MAIL:PASS':
            return extractMailPass(parts);
            
        case 'USERNAME:PASS':
        case 'USER:PASS':
            return extractUsernamePass(parts, cleaned);
            
        case 'URL:MAIL:PASS':
            return extractUrlMailPass(parts);
    }
    return null;
}

// URL:PASS extraction
function extractUrlPass(parts) {
    for (let i = 0; i < parts.length - 1; i++) {
        const url = parts[i];
        const pass = parts[i+1];
        
        if (isValidUrlForExtraction(url) && pass.length > 0) {
            return `${url}:${pass}`;
        }
    }
    return null;
}

// MAIL:PASS extraction  
function extractMailPass(parts) {
    for (let i = 0; i < parts.length - 1; i++) {
        const email = parts[i];
        const pass = parts[i+1];
        
        if (email.includes('@') && email.includes('.') && 
            email.split('@').length === 2 && pass.length > 0) {
            return `${email}:${pass}`;
        }
    }
    return null;
}

// USERNAME:PASS extraction - SUPER STRICT
function extractUsernamePass(parts, originalLine) {
    for (let i = 0; i < parts.length - 1; i++) {
        const username = parts[i];
        const password = parts[i+1];
        
        // STRICT USERNAME VALIDATION
        if (isValidUsername(username, originalLine) && password.length > 0) {
            return `${username}:${password}`;
        }
    }
    return null;
}

// URL:MAIL:PASS extraction
function extractUrlMailPass(parts) {
    if (parts.length < 3) return null;
    
    for (let i = 0; i < parts.length - 2; i++) {
        const url = parts[i];
        const email = parts[i+1];
        const pass = parts[i+2];
        
        if (isValidUrlForExtraction(url) && 
            email.includes('@') && email.includes('.') && 
            pass.length > 0) {
            return `${url}:${email}:${pass}`;
        }
    }
    return null;
}

// SUPER STRICT username validation
function isValidUsername(username, originalLine) {
    if (!username || username.length < 2 || username.length > 25) return false;
    
    // ABSOLUTE REJECTIONS for USERNAME format
    if (username.includes('@')) return false;  // Email
    if (username.startsWith('http')) return false;  // URL
    if (username.includes('//')) return false;  // URL
    if (username.includes('/')) return false;  // Path
    if (username.includes('www.')) return false;  // WWW
    if (username.includes('.com')) return false;  // Domain
    if (username.includes('.org')) return false;  // Domain
    if (username.includes('.net')) return false;  // Domain
    if (username.includes('.edu')) return false;  // Domain
    if (username.includes('.gov')) return false;  // Domain
    if (username.includes('.co.')) return false;  // Domain
    if (username.includes('cart.')) return false;  // Specific domain
    if (username.includes('godaddy')) return false;  // Specific domain
    if (username.includes('checkout')) return false;  // URL path
    if (username.includes('account')) return false;  // URL path
    
    // Check if it's a domain pattern (word.word.word)
    if (username.includes('.')) {
        const dotParts = username.split('.');
        if (dotParts.length >= 2) {
            const lastPart = dotParts[dotParts.length - 1].toLowerCase();
            // Common TLDs - reject if looks like domain
            const tlds = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'uk', 'de', 'fr', 'jp', 'cn', 'ru', 'br', 'au', 'ca', 'mx', 'in', 'kr', 'it', 'es', 'nl', 'pl', 'se', 'no', 'dk', 'fi', 'be', 'ch', 'at', 'ie', 'pt', 'gr', 'cz', 'hu', 'ro', 'bg', 'hr', 'sk', 'si', 'lt', 'lv', 'ee', 'is', 'mt', 'lu', 'cy'];
            if (tlds.includes(lastPart)) return false;
            
            // If multiple dots and looks domain-like, reject
            if (dotParts.length >= 3) return false;
        }
    }
    
    // Check original line for URL indicators
    if (originalLine.includes('https://') || originalLine.includes('http://')) {
        // If line contains URLs, be extra careful
        if (username.includes('.')) return false;
    }
    
    // Valid username patterns (letters, numbers, common symbols)
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
        // Allow some special chars but not URL chars
        if (username.includes('<') || username.includes('>') || 
            username.includes('[') || username.includes(']')) return false;
    }
    
    return true;
}

// URL validation for extraction
function isValidUrlForExtraction(url) {
    if (!url || url.length < 4) return false;
    
    // Must contain dot for domain
    if (!url.includes('.')) return false;
    
    // Should not be email
    if (url.includes('@')) return false;
    
    // Should look like URL/domain
    return url.includes('.com') || url.includes('.org') || url.includes('.net') || 
           url.includes('.edu') || url.includes('.gov') || url.startsWith('http') ||
           url.includes('/') || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url);
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



// AI-powered combo extraction
async function extractComboWithAI(lines, format) {
    try {
        // Prepare the prompt for AI
        const formatDescriptions = {
            'URL:PASS': 'URL ve şifre formatında (örnek: https://site.com:password123)',
            'MAIL:PASS': 'Email ve şifre formatında (örnek: user@domain.com:password123)', 
            'USERNAME:PASS': 'Kullanıcı adı ve şifre formatında (örnek: username:password123)',
            'USER:PASS': 'Kullanıcı adı ve şifre formatında (örnek: user:password123)',
            'URL:MAIL:PASS': 'URL, email ve şifre formatında (örnek: https://site.com:user@domain.com:password123)'
        };

        // Satırları agresif şekilde temizle ve analiz et
        const processedData = [];
        
        for (const line of lines) {
            let cleaned = line.trim();
            
            // Tüm olası satır numarası formatlarını temizle
            cleaned = cleaned.replace(/^\[\d+\]\s*:?\s*/, ''); // [123456]: 
            cleaned = cleaned.replace(/^\d+\]\s*:?\s*/, ''); // 123456]:
            cleaned = cleaned.replace(/^\d+:\s*/, ''); // 123456:
            cleaned = cleaned.replace(/^\d+\s+/, ''); // 123456 space
            
            if (!cleaned || cleaned.length < 5) continue;
            if (!cleaned.includes(':')) continue;
            
            // Format-specific extraction
            if (format === 'URL:PASS') {
                // URL:PASS için - domain veya http içeren kısımları bul
                if (cleaned.includes('.') && cleaned.split(':').length >= 2) {
                    const parts = cleaned.split(':');
                    if (parts[0].includes('.') && parts[1] && parts[1].trim().length > 0) {
                        processedData.push(`${parts[0]}:${parts[1]}`);
                    }
                }
            } else if (format === 'MAIL:PASS') {
                // MAIL:PASS için - @ içeren kısımları bul
                if (cleaned.includes('@') && cleaned.split(':').length >= 2) {
                    const parts = cleaned.split(':');
                    if (parts[0].includes('@') && parts[1] && parts[1].trim().length > 0) {
                        processedData.push(`${parts[0]}:${parts[1]}`);
                    }
                }
                         } else if (format === 'USERNAME:PASS' || format === 'USER:PASS') {
                 // USERNAME:PASS için - username:password formatını al
                 const parts = cleaned.split(':');
                 if (parts.length >= 2 && parts[0] && parts[1]) {
                     // URL ve email olmayan kullanıcı adlarını al
                     const username = parts[0].trim();
                     const password = parts[1].trim();
                     
                     // Basit username kontrolü - URL veya email değilse al
                     if (!username.includes('@') && 
                         !username.startsWith('http') && 
                         !username.includes('/') &&
                         username.length > 2 && username.length < 30 &&
                         password.length > 0) {
                         
                         // Eğer username'de domain var ama başka işaretler yoksa al
                         if (username.includes('.')) {
                             // Sadece domain.com gibi basit domain'leri reddet
                             if (!username.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                                 processedData.push(`${username}:${password}`);
                             }
                         } else {
                             // Nokta içermeyenler kesinlikle username
                             processedData.push(`${username}:${password}`);
                         }
                     }
                 }
            } else if (format === 'URL:MAIL:PASS') {
                // URL:MAIL:PASS için - 3 parça olmalı
                const parts = cleaned.split(':');
                if (parts.length >= 3 && parts[0].includes('.') && parts[1].includes('@')) {
                    processedData.push(`${parts[0]}:${parts[1]}:${parts[2]}`);
                }
            }
        }

                 const prompt = `Bu log verilerinden SADECE ${format} formatında temiz kombinasyonları çıkar.

MUTLAK KURALLAR:
1. ASLA satır numarası ekleme (123456]: gibi)
2. ASLA köşeli parantez ekleme [123456]
3. SADECE ${format} formatında sonuç ver
4. Geçersiz verileri atla

${format === 'URL:PASS' ? 'İSTENEN: site.com:password şeklinde - URL içeren' : 
  format === 'MAIL:PASS' ? 'İSTENEN: email@domain.com:password şeklinde - @ içeren' :
  format === 'USERNAME:PASS' || format === 'USER:PASS' ? 'İSTENEN: kullanici:sifre şeklinde - URL değil, email değil, sadece username' :
  'İSTENEN: site.com:email@domain.com:password şeklinde'}

${format === 'USERNAME:PASS' || format === 'USER:PASS' ? 
  'YASAKLI: https, http, .com, .org, cart., www, / içeren hiçbir şey alma!' : ''}

VERİ:
${processedData.slice(0, 10).join('\n')}

CEVAP: JSON array ["combo1", "combo2"]`;

        const response = await fetch('https://api.ashlynn-repo.tech/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: prompt,
                model: 'gpt-4o-mini'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 200 && data.successful === 'success') {
            try {
                // AI response'u parse et
                let aiResponse = data.response.trim();
                // console.log('AI Response:', aiResponse); // Debug için
                
                // JSON array'i bul ve parse et
                const jsonMatch = aiResponse.match(/\[[\s\S]*?\]/);
                if (jsonMatch) {
                    const parsedResults = JSON.parse(jsonMatch[0]);
                    if (Array.isArray(parsedResults)) {
                        // Sonuçları temizle ve filtrele
                        const cleanResults = parsedResults
                            .filter(item => typeof item === 'string' && item.trim().length > 0)
                            .map(item => {
                                // Tüm temizleme işlemlerini yap
                                let cleaned = item.trim();
                                // Satır numaralarını temizle
                                cleaned = cleaned.replace(/^\[\d+\]\s*:?\s*/, ''); // [123456]: 
                                cleaned = cleaned.replace(/^\d+\]\s*:?\s*/, ''); // 123456]:
                                cleaned = cleaned.replace(/^\d+:\s*/, ''); // 123456:
                                cleaned = cleaned.replace(/^["'\s]+|["'\s]+$/g, ''); // Tırnak ve boşluk
                                return cleaned;
                            })
                            .filter(item => {
                                if (!item || item.length === 0) return false;
                                if (!item.includes(':')) return false; // : içermeyenler
                                if (item.match(/^\d+/)) return false; // Sayı ile başlayanlar
                                if (item.includes('[') || item.includes(']')) return false; // Köşeli parantez
                                if (item.match(/^https?$/)) return false; // Sadece protokol
                                
                                // Format kontrolü
                                const parts = item.split(':');
                                if (format === 'URL:PASS') {
                                    return parts.length >= 2 && (parts[0].includes('.') || parts[0].startsWith('http'));
                                } else if (format === 'MAIL:PASS') {
                                    return parts.length >= 2 && parts[0].includes('@') && parts[0].includes('.');
                                } else if (format === 'USERNAME:PASS' || format === 'USER:PASS') {
                                    return parts.length >= 2 && !parts[0].includes('@') && !parts[0].includes('.');
                                } else if (format === 'URL:MAIL:PASS') {
                                    return parts.length >= 3;
                                }
                                return parts.length >= 2;
                            });
                        
                        return cleanResults;
                    }
                }
                
                // JSON parse başarısız olursa, manuel parsing
                const lines = aiResponse.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                
                const cleanResults = [];
                for (const line of lines) {
                    // Kapsamlı temizleme
                    let cleaned = line.trim();
                    cleaned = cleaned.replace(/^["'\[\],\s]+|["'\[\],\s]+$/g, '');
                    
                    // Satır numaralarını temizle
                    cleaned = cleaned.replace(/^\[\d+\]\s*:?\s*/, ''); // [123456]: 
                    cleaned = cleaned.replace(/^\d+\]\s*:?\s*/, ''); // 123456]:
                    cleaned = cleaned.replace(/^\d+:\s*/, ''); // 123456:
                    
                    // Geçersiz formatları filtrele
                    if (!cleaned || cleaned.length === 0) continue;
                    if (!cleaned.includes(':')) continue; // : içermeyenler
                    if (cleaned.match(/^\d+/)) continue; // Sayı ile başlayanlar
                    if (cleaned.includes('[') || cleaned.includes(']')) continue; // Köşeli parantez
                    if (cleaned.match(/^https?$/)) continue; // Sadece protokol
                    
                    // Format kontrolü
                    const parts = cleaned.split(':');
                    let isValid = false;
                    
                    if (format === 'URL:PASS') {
                        isValid = parts.length >= 2 && (parts[0].includes('.') || parts[0].startsWith('http'));
                    } else if (format === 'MAIL:PASS') {
                        isValid = parts.length >= 2 && parts[0].includes('@') && parts[0].includes('.');
                    } else if (format === 'USERNAME:PASS' || format === 'USER:PASS') {
                        isValid = parts.length >= 2 && !parts[0].includes('@') && !parts[0].includes('.');
                    } else if (format === 'URL:MAIL:PASS') {
                        isValid = parts.length >= 3;
                    }
                    
                    if (isValid) {
                        cleanResults.push(cleaned);
                    }
                }
                
                return cleanResults;
                
            } catch (parseError) {
                console.error('AI response parse error:', parseError);
                return [];
            }
        } else {
            throw new Error(`API error: ${data.status}`);
        }
        
    } catch (error) {
        console.error('AI extraction error:', error);
        throw error; // Re-throw to trigger fallback
    }
}

// Performance optimization: Use Web Workers for large file processing
function processLargeFileInWorker(content, callback) {
    // This could be implemented with Web Workers for even better performance
    // For now, we use setTimeout to prevent UI blocking
    setTimeout(() => {
        callback(content);
    }, 10);
} 