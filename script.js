const elements = {
    uploadButton: document.getElementById('uploadButton'),
    fileInput: document.getElementById('fileInput'),
    fileList: document.getElementById('fileList'),
    folderList: document.getElementById('folderList'),
    createFolderButton: document.getElementById('createFolder'),
    toggleThemeButton: document.getElementById('toggleTheme'),
    currentPathSpan: document.getElementById('currentPath'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalInput: document.getElementById('modalInput'),
    modalConfirm: document.getElementById('modalConfirm'),
    modalCancel: document.getElementById('modalCancel'),
    modalClose: document.getElementById('modalClose'),
    helpButton: document.getElementById('helpButton'),
    helpModal: document.getElementById('helpModal'),
    helpModalClose: document.getElementById('helpModalClose')
};

let filesArray = JSON.parse(localStorage.getItem('filesArray')) || [];
let currentPath = [];
let theme = localStorage.getItem('theme') || 'dark';
let currentFileToRename = null;

document.body.className = `theme-${theme}`;
addEventListeners();
renderFiles();

function addEventListeners() {
    elements.uploadButton.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileUpload);
    elements.createFolderButton.addEventListener('click', showCreateFolderModal);
    elements.toggleThemeButton.addEventListener('click', toggleTheme);
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', handleModalConfirm);
    elements.helpButton.addEventListener('click', showHelpModal);
    elements.helpModalClose.addEventListener('click', closeHelpModal);
}

function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const path = currentPath.join('/');
    const currentDate = new Date().toISOString().split('T')[0];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            filesArray.push({
                name: file.name,
                size: file.size,
                type: file.name.split('.').pop().toLowerCase(),
                content: event.target.result,
                path: path,
                date: currentDate
            });
            saveFiles();
            renderFiles();
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
}

function renderFiles() {
    elements.fileList.innerHTML = '';
    elements.folderList.innerHTML = '';
    updatePathDisplay();

    const currentFolder = currentPath.join('/');
    const filtered = filesArray.filter(file => file.path === currentFolder);

    filtered.forEach(file => {
        const li = document.createElement('li');
        li.dataset.name = file.name;
        li.dataset.path = file.path;
        li.innerHTML = `
            <span>${file.name} (${(file.size / 1024).toFixed(2)} KB) - ${file.date}</span>
            <div class="buttons">
                <button class="download-btn" title="Baixar arquivo"><i class="fas fa-download"></i></button>
                <button class="delete-btn" title="Excluir arquivo ou pasta"><i class="fas fa-trash"></i></button>
                <button class="rename-btn" title="Renomear arquivo ou pasta"><i class="fas fa-edit"></i></button>
                <button class="view-btn" title="Visualizar arquivo"><i class="fas fa-eye"></i></button>
            </div>
        `;

        if (file.type === 'folder') {
            li.addEventListener('dblclick', () => navigateToFolder(file));
            elements.folderList.appendChild(li);
        } else {
            elements.fileList.appendChild(li);
        }

        li.querySelector('.download-btn').addEventListener('click', () => downloadFile(file.name, file.path));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteFile(file.name, file.path));
        li.querySelector('.rename-btn').addEventListener('click', () => showRenameModal(file.name, file.path));
        li.querySelector('.view-btn').addEventListener('click', () => viewFile(file.name, file.path));
    });
}

function saveFiles() {
    localStorage.setItem('filesArray', JSON.stringify(filesArray));
}

function downloadFile(fileName, path) {
    const file = filesArray.find(f => f.name === fileName && f.path === path);
    if (!file || !file.content) return;
    const a = document.createElement('a');
    a.href = file.content;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function deleteFile(fileName, path) {
    filesArray = filesArray.filter(f => !(f.name === fileName && f.path === path));
    saveFiles();
    renderFiles();
}

function showRenameModal(fileName, path) {
    currentFileToRename = filesArray.find(f => f.name === fileName && f.path === path);
    if (!currentFileToRename) return;
    elements.modalTitle.textContent = 'Renomear Arquivo';
    elements.modalInput.value = currentFileToRename.name;
    elements.modal.style.display = 'block';
}

function showCreateFolderModal() {
    currentFileToRename = null;
    elements.modalTitle.textContent = 'Nova Pasta';
    elements.modalInput.value = '';
    elements.modal.style.display = 'block';
}

function handleModalConfirm() {
    const newName = elements.modalInput.value.trim();
    if (!newName) return;

    if (currentFileToRename) {
        currentFileToRename.name = newName;
    } else {
        const path = currentPath.join('/');
        filesArray.push({
            name: newName,
            type: 'folder',
            path: path,
            date: new Date().toISOString().split('T')[0],
            size: 0
        });
    }
    saveFiles();
    renderFiles();
    closeModal();
}

function closeModal() {
    elements.modal.style.display = 'none';
    elements.modalInput.value = '';
    currentFileToRename = null;
}

function navigateToFolder(folder) {
    currentPath.push(folder.name);
    renderFiles();
}

function navigateToRoot() {
    currentPath = [];
    renderFiles();
}

function viewFile(fileName, path) {
    const file = filesArray.find(f => f.name === fileName && f.path === path);
    if (!file || !file.content) return;
    window.open(file.content, '_blank');
}

function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    document.body.className = `theme-${theme}`;
}

function updatePathDisplay() {
    elements.currentPathSpan.innerHTML = currentPath.map(p => 
        `<span onclick="navigateToPath('${p}')" title="Ir para ${p}">${p}</span>`
    ).join(' / ');
}

function navigateToPath(folderName) {
    const index = currentPath.indexOf(folderName);
    if (index !== -1) {
        currentPath = currentPath.slice(0, index + 1);
        renderFiles();
    }
}

function showHelpModal() {
    elements.helpModal.style.display = 'block';
}

function closeHelpModal() {
    elements.helpModal.style.display = 'none';
}
