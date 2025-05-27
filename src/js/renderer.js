// Global variables
let currentImagePath = '';
let buttonCount = 4;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    translatePage();
});

function translatePage() {
    // Translate all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = getTranslation(key);
    });
}

function initializeEventListeners() {
    // Handle native folder selection
    document.getElementById('folderInput').addEventListener('change', handleFolderSelection);

    // Handle trigger from menu
    window.electronAPI.onTriggerFolderSelection(() => {
        document.getElementById('folderInput').click();
    });

    // Handle navigation events from main process
    window.electronAPI.onNextImage(nextImageLocal);
    window.electronAPI.onPreviousImage(previousImageLocal);
    window.electronAPI.onRevealImage(clearButtons);
    window.electronAPI.onCloseFolder(handleCloseFolder);

    // Add error handler for image loading
    document.getElementById('main-image').addEventListener('error', (error) => {
        console.error('Error loading image:', error);
    });

    document.getElementById('main-image').addEventListener('load', () => {
        console.log('Image loaded:', document.getElementById('main-image').src);
        if (document.getElementById('button-count-dialog').style.display === 'none') {
            createButtons();
        }
    });

    // Handle keyboard shortcuts
    setupKeyboardShortcuts();

    // Handle control buttons
    document.getElementById('reveal-button').addEventListener('click', clearButtons);
    document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);

    // Handle grid size buttons
    document.querySelectorAll('.grid-size-button').forEach(button => {
        button.addEventListener('click', () => {
            const size = parseInt(button.dataset.size);
            setButtonCount(size);
        });
    });

    // Handle button count input
    document.getElementById('button-count').addEventListener('change', validateButtonCount);

    // Handle start button
    document.getElementById('start-button').addEventListener('click', createButtons);

    // Update fullscreen button text based on fullscreen state
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
}

async function handleFolderSelection(event) {
    const files = Array.from(event.target.files);
    console.log('Files selected:', files.length);
    
    if (files.length === 0) {
        return;
    }
    
    // Filter image files locally
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const imageFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return imageExtensions.includes('.' + ext);
    });
    
    console.log('Image files found:', imageFiles.length);
    
    if (imageFiles.length === 0) {
        alert(getTranslation('noImagesFound'));
        return;
    }
    
    // Get folder name
    const folderName = files[0].webkitRelativePath ? 
        files[0].webkitRelativePath.split('/')[0] : 
        'Selected Folder';
    
    // Store files globally for navigation
    window.currentImageFiles = imageFiles;
    window.currentImageIndex = 0;
    
    // Create blob URL for first image
    const firstImageUrl = URL.createObjectURL(imageFiles[0]);
    
    // Update UI
    updateUIForNewFolder(firstImageUrl, folderName, imageFiles.length);
    
    try {
        await window.electronAPI.invoke('folder-selected-notification', {
            folderName: folderName,
            imageCount: imageFiles.length
        });
    } catch (error) {
        console.error('Error notifying main process:', error);
    }
}

function updateUIForNewFolder(firstImageUrl, folderName, totalImages) {
    document.getElementById('welcome-message').style.display = 'none';
    document.getElementById('image-container').style.display = 'flex';
    document.getElementById('status-bar').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    
    currentImagePath = firstImageUrl;
    document.getElementById('main-image').src = firstImageUrl;
    
    // Wait for image to load before showing dialog
    document.getElementById('main-image').onload = () => {
        if (window.currentImageIndex === 0) {
            document.getElementById('button-count-dialog').style.display = 'block';
            document.getElementById('image-overlay').style.display = 'block';
        }
    };
    
    document.title = `ImageGuess - ${folderName}`;
    updateStatusBar(1, totalImages);
}

function handleCloseFolder() {
    document.getElementById('welcome-message').style.display = 'block';
    document.getElementById('image-container').style.display = 'none';
    document.getElementById('button-count-dialog').style.display = 'none';
    document.getElementById('status-bar').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    document.title = 'ImageGuess';
    clearButtons();
    window.currentImageFiles = null;
    window.currentImageIndex = 0;
    if (window.currentImagePath && window.currentImagePath.startsWith('blob:')) {
        URL.revokeObjectURL(window.currentImagePath);
    }
}

function updateStatusBar(current, total) {
    document.getElementById('status-bar').textContent = getTranslation('imageCount', { current, total });
}

function setupKeyboardShortcuts() {
    let keyActionTaken = {};
    
    document.addEventListener('keydown', (event) => {
        // Prevent action if dialog is open
        if (document.getElementById('button-count-dialog').style.display === 'block') {
            return;
        }

        // Prevent action if already taken for this key press
        if (keyActionTaken[event.code]) {
            event.preventDefault();
            return;
        }
        
        keyActionTaken[event.code] = true;
        
        switch(event.code) {
            case 'ArrowRight':
                event.preventDefault();
                nextImageLocal();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                previousImageLocal();
                break;
            case 'Space':
                event.preventDefault();
                clearButtons();
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        keyActionTaken[event.code] = false;
    });
}

function nextImageLocal() {
    if (!window.currentImageFiles || window.currentImageFiles.length === 0) {
        console.log(getTranslation('noImagesAvailable'));
        return;
    }
    
    if (window.currentImageIndex < window.currentImageFiles.length - 1) {
        window.currentImageIndex++;
        loadCurrentImage();
    } else {
        console.log(getTranslation('alreadyAtLast'));
    }
}

function previousImageLocal() {
    if (!window.currentImageFiles || window.currentImageFiles.length === 0) {
        console.log(getTranslation('noImagesAvailable'));
        return;
    }
    
    if (window.currentImageIndex > 0) {
        window.currentImageIndex--;
        loadCurrentImage();
    } else {
        console.log(getTranslation('alreadyAtFirst'));
    }
}

function loadCurrentImage() {
    if (!window.currentImageFiles || window.currentImageFiles.length === 0) {
        console.log('No images to load');
        return;
    }
    
    const currentImage = window.currentImageFiles[window.currentImageIndex];
    
    if (currentImagePath && currentImagePath.startsWith('blob:')) {
        URL.revokeObjectURL(currentImagePath);
    }
    
    currentImagePath = URL.createObjectURL(currentImage);
    document.getElementById('main-image').src = currentImagePath;
    updateStatusBar(window.currentImageIndex + 1, window.currentImageFiles.length);
    
    document.getElementById('main-image').onload = () => {
        createButtons();
    };
}

function createButtons() {
    if (!validateButtonCount()) {
        return;
    }
    
    buttonCount = parseInt(document.getElementById('button-count').value);
    if (buttonCount < 1) buttonCount = 1;
    
    clearButtons();
    document.getElementById('image-overlay').style.display = 'none';
    
    const cols = Math.ceil(Math.sqrt(buttonCount));
    const rows = Math.ceil(buttonCount / cols);
    
    const grid = document.createElement('div');
    grid.id = 'button-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cellWidth = viewportWidth / cols;
    const cellHeight = viewportHeight / rows;
    const fontSize = Math.min(cellWidth, cellHeight) * 0.15;
    
    const totalCells = cols * rows;
    
    for (let i = 0; i < totalCells; i++) {
        if (i < buttonCount) {
            const button = document.createElement('div');
            button.className = 'overlay-button';
            button.style.fontSize = `${fontSize}px`;
            button.textContent = (i + 1).toString();

            button.addEventListener('click', () => {
                button.style.opacity = '0';
                button.style.pointerEvents = 'none';
            });

            grid.appendChild(button);
        } else {
            const spacer = document.createElement('div');
            spacer.className = 'button-spacer';
            grid.appendChild(spacer);
        }
    }

    document.body.appendChild(grid);
    document.getElementById('button-count-dialog').style.display = 'none';
}

function clearButtons() {
    const grid = document.getElementById('button-grid');
    if (grid) {
        grid.remove();
    }
}

function setButtonCount(count) {
    document.getElementById('button-count').value = count;
    if (validateButtonCount()) {
        createButtons();
    }
}

function validateButtonCount() {
    const count = parseInt(document.getElementById('button-count').value);
    const validationMessage = document.getElementById('validation-message');
    
    if (isNaN(count) || count < 1) {
        validationMessage.textContent = getTranslation('enterPositiveNumber');
        validationMessage.style.color = 'red';
        return false;
    }
    
    if (count > 100) {
        validationMessage.textContent = getTranslation('maxButtonsAllowed');
        validationMessage.style.color = 'red';
        return false;
    }
    
    const sqrt = Math.sqrt(count);
    if (sqrt % 1 !== 0) {
        const nearestLower = Math.floor(sqrt) ** 2;
        const nearestHigher = Math.ceil(sqrt) ** 2;
        validationMessage.textContent = getTranslation('enterPerfectSquare', {
            lower: nearestLower,
            higher: nearestHigher
        });
        validationMessage.style.color = 'red';
        return false;
    }
    
    validationMessage.textContent = getTranslation('perfectGrid', { size: sqrt });
    validationMessage.style.color = 'green';
    return true;
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

function updateFullscreenButtonText() {
    const button = document.getElementById('fullscreen-button');
    if (document.fullscreenElement) {
        button.textContent = getTranslation('exitFullscreen');
    } else {
        button.textContent = getTranslation('fullscreen');
    }
} 