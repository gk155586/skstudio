// Admin Panel JavaScript

let currentContent = {};
let selectedImage = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    loadImages();
    setupImageUpload();
    setupColorPickers();
});

// Load content from server
async function loadContent() {
    try {
        const response = await fetch('/api/content');
        currentContent = await response.json();
        populateFields();
    } catch (error) {
        showNotification('Failed to load content', 'error');
    }
}

// Populate form fields
function populateFields() {
    if (currentContent.hero) {
        document.getElementById('hero-title').value = currentContent.hero.title || '';
        document.getElementById('hero-subtitle').value = currentContent.hero.subtitle || '';
        document.getElementById('hero-text').value = currentContent.hero.text || '';
        document.getElementById('hero-price').value = currentContent.hero.price || '';
        document.getElementById('hero-bg').value = currentContent.hero.backgroundImage || '';
    }
}

// Save changes
async function saveChanges() {
    // Collect all data
    currentContent.hero = {
        title: document.getElementById('hero-title').value,
        subtitle: document.getElementById('hero-subtitle').value,
        text: document.getElementById('hero-text').value,
        price: document.getElementById('hero-price').value,
        backgroundImage: document.getElementById('hero-bg').value,
        font: document.getElementById('hero-font').value,
        color: document.getElementById('hero-color').value
    };

    try {
        const response = await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentContent)
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Changes saved successfully!', 'success');
            // Reload preview if open
            const previewFrame = document.getElementById('previewFrame');
            if (previewFrame) {
                previewFrame.src = previewFrame.src;
            }
        }
    } catch (error) {
        showNotification('Failed to save changes', 'error');
    }
}

// Image upload setup
function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        uploadImages(files);
    });

    imageInput.addEventListener('change', (e) => {
        uploadImages(e.target.files);
    });
}

// Upload images
async function uploadImages(files) {
    for (let file of files) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                showNotification(`${file.name} uploaded successfully!`, 'success');
                loadImages();
            }
        } catch (error) {
            showNotification(`Failed to upload ${file.name}`, 'error');
        }
    }
}

// Load images
async function loadImages() {
    try {
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.success) {
            displayImages(data.images);
        }
    } catch (error) {
        console.error('Failed to load images:', error);
    }
}

// Display images in gallery
function displayImages(images) {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';

    images.forEach(image => {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.innerHTML = `
            <img src="${image.url}" alt="${image.filename}">
            <button class="delete-btn" onclick="deleteImage('${image.filename}')">×</button>
        `;
        
        div.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                selectImage(image.url, div);
            }
        });

        gallery.appendChild(div);
    });
}

// Select image
function selectImage(url, element) {
    // Remove previous selection
    document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection
    element.classList.add('selected');
    selectedImage = url;
    
    showNotification('Image selected! Click "Use Selected Image" to apply.', 'success');
}

// Select image for hero
function selectImageForHero() {
    if (selectedImage) {
        document.getElementById('hero-bg').value = selectedImage;
        showNotification('Image applied to hero section!', 'success');
    } else {
        showNotification('Please select an image first', 'error');
    }
}

// Delete image
async function deleteImage(filename) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return;
    }

    try {
        const response = await fetch(`/api/images/${filename}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showNotification('Image deleted successfully!', 'success');
            loadImages();
        }
    } catch (error) {
        showNotification('Failed to delete image', 'error');
    }
}

// Show panel
function showPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = 'none';
    });

    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected panel
    document.getElementById(`${panelName}-panel`).style.display = 'block';

    // Add active class to clicked sidebar item
    event.target.classList.add('active');
}

// Setup color pickers
function setupColorPickers() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    
    colorInputs.forEach(input => {
        const textInput = document.getElementById(input.id + '-text');
        
        input.addEventListener('input', (e) => {
            textInput.value = e.target.value;
        });

        textInput.addEventListener('input', (e) => {
            input.value = e.target.value;
        });
    });
}

// Add product
function addProduct() {
    const productsList = document.getElementById('productsList');
    const productId = 'product_' + Date.now();
    
    const productDiv = document.createElement('div');
    productDiv.className = 'editable-section';
    productDiv.id = productId;
    productDiv.innerHTML = `
        <div class="edit-controls">
            <button class="edit-btn" onclick="editProduct('${productId}')">✏️ Edit</button>
            <button class="edit-btn" onclick="deleteProduct('${productId}')">🗑️ Delete</button>
        </div>
        <h3>New Product</h3>
        <div class="form-group">
            <label>Product Name</label>
            <input type="text" class="product-name" placeholder="Enter product name">
        </div>
        <div class="form-group">
            <label>Price</label>
            <input type="text" class="product-price" placeholder="INR 0.00">
        </div>
        <div class="form-group">
            <label>Image URL</label>
            <input type="text" class="product-image" placeholder="Image URL">
        </div>
        <div class="form-group">
            <label>Badge</label>
            <select class="product-badge">
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="Sold Out">Sold Out</option>
                <option value="New">New</option>
                <option value="">None</option>
            </select>
        </div>
    `;
    
    productsList.appendChild(productDiv);
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        document.getElementById(productId).remove();
        showNotification('Product deleted', 'success');
    }
}

// Add theme
function addTheme() {
    const themesList = document.getElementById('themesList');
    const themeId = 'theme_' + Date.now();
    
    const themeDiv = document.createElement('div');
    themeDiv.className = 'editable-section';
    themeDiv.id = themeId;
    themeDiv.innerHTML = `
        <div class="edit-controls">
            <button class="edit-btn" onclick="deleteTheme('${themeId}')">🗑️ Delete</button>
        </div>
        <h3>New Theme</h3>
        <div class="form-group">
            <label>Theme Name</label>
            <input type="text" class="theme-name" placeholder="Enter theme name">
        </div>
        <div class="form-group">
            <label>Image URL</label>
            <input type="text" class="theme-image" placeholder="Image URL">
        </div>
    `;
    
    themesList.appendChild(themeDiv);
}

// Delete theme
function deleteTheme(themeId) {
    if (confirm('Are you sure you want to delete this theme?')) {
        document.getElementById(themeId).remove();
        showNotification('Theme deleted', 'success');
    }
}

// Preview site
function previewSite() {
    showPanel('preview');
    const previewFrame = document.getElementById('previewFrame');
    previewFrame.src = '/?preview=true&t=' + Date.now();
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/logout';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Auto-save functionality
let autoSaveTimer;
document.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        console.log('Auto-saving...');
        // Uncomment to enable auto-save
        // saveChanges();
    }, 5000);
});
