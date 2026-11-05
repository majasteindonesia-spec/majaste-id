document.addEventListener("DOMContentLoaded", function() {
    
    // =========================================
    // 1. LOGIKA HEADER (HAMBURGER & DROPDOWN)
    // =========================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            navMenu.classList.toggle('active');
        });

        const dropBtns = document.querySelectorAll('.dropbtn');
        dropBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    this.parentElement.classList.toggle('active');
                }
            });
        });
    }

    // =========================================
    // 2. LOGIKA RANDOM GAMBAR (HOME)
    // =========================================
    function getRandomNumber(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    const batasMaksimalHome = 5; 
    const imgKaos = document.getElementById("img-kaos");
    if (imgKaos) imgKaos.src = `assets/portfolio/kaos/majaste-kaos (${getRandomNumber(batasMaksimalHome)}).jpg`;

    const imgPolo = document.getElementById("img-polo");
    if (imgPolo) imgPolo.src = `assets/portfolio/polo/majaste-polo (${getRandomNumber(batasMaksimalHome)}).jpg`;

    const imgJaket = document.getElementById("img-jaket");
    if (imgJaket) imgJaket.src = `assets/portfolio/jaketsingle/majaste-sl (${getRandomNumber(batasMaksimalHome)}).jpg`;

    const imgJersey = document.getElementById("img-jersey");
    if (imgJersey) imgJersey.src = `assets/portfolio/jersey/majaste-jersey (${getRandomNumber(batasMaksimalHome)}).jpg`;

    // =========================================
    // 3. LOGIKA PORTFOLIO (FILTER & PAGINATION)
    // =========================================
    if (document.getElementById('portfolio-grid')) {
        const config = {
            'kaos':        { prefix: 'majaste-kaos', folder: 'kaos' },
            'polo':        { prefix: 'majaste-polo', folder: 'polo' },
            'jersey':      { prefix: 'majaste-jersey', folder: 'jersey' },
            'kemejapdh':   { prefix: 'majaste-kemejapdh', folder: 'kemejapdh' },
            'jaketsingle': { prefix: 'majaste-sl', folder: 'jaketsingle' },
            'jaketdouble': { prefix: 'majaste-jaketdouble', folder: 'jaketdouble' },
            'training':    { prefix: 'majaste-training', folder: 'training' }
        };

        let currentCategory = 'kaos';
        let currentPage = 1;
        let itemsPerPage = 8; 
        let totalDetectedImages = 0; 
        let allImages = []; 

        const grid = document.getElementById('portfolio-grid');
        const pageNumbers = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const filterSelect = document.getElementById('filter-select');

        function checkScreenSize() {
            if (window.innerWidth <= 768) { itemsPerPage = 4; } else { itemsPerPage = 8; }
        }
        checkScreenSize(); 
        window.addEventListener('resize', () => { checkScreenSize(); renderGallery(); });

        function detectImages(category, callback) {
            let foundImages = [];
            let checkIndex = 1;
            let maxLimit = 100; 

            function checkNext() {
                if (checkIndex > maxLimit) { callback(foundImages); return; }
                const data = config[category];
                const imgSrc = `assets/portfolio/${data.folder}/${data.prefix} (${checkIndex}).jpg`;
                const img = new Image();

                img.onload = function() {
                    foundImages.push(imgSrc);
                    checkIndex++;
                    checkNext(); 
                };

                img.onerror = function() {
                    if (checkIndex > 1 && foundImages.length > 0) {
                        checkIndex++;
                        if (checkIndex > foundImages.length + 3) { callback(foundImages); } else { checkNext(); }
                    } else if (checkIndex === 1) { callback([]); } else { callback(foundImages); }
                };
                img.src = imgSrc;
            }
            checkNext(); 
        }

        function renderGallery() {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Memuat gambar...</p>';
            detectImages(currentCategory, function(images) {
                allImages = images;
                totalDetectedImages = images.length;

                if (totalDetectedImages === 0) {
                    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Belum ada gambar di kategori ini.</p>';
                    pageNumbers.innerHTML = '';
                    return;
                }

                grid.innerHTML = ''; 
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, totalDetectedImages);
                
                for (let i = startIndex; i < endIndex; i++) {
                    const imgDiv = document.createElement('div');
                    imgDiv.classList.add('portfolio-item');
                    const img = document.createElement('img');
                    img.src = allImages[i]; 
                    img.alt = `${currentCategory} ${i+1}`;
                    img.onclick = function() { openModal(this.src); };
                    imgDiv.appendChild(img);
                    grid.appendChild(imgDiv);
                }
                renderPagination(); 
            });
        }

        function renderPagination() {
            pageNumbers.innerHTML = '';
            const totalPages = Math.ceil(totalDetectedImages / itemsPerPage);
            if (totalPages <= 1) return; 

            for (let i = 1; i <= totalPages; i++) {
                const span = document.createElement('span');
                span.innerText = i;
                span.classList.add('page-num');
                if (i === currentPage) span.classList.add('active');
                span.onclick = function() { currentPage = i; renderGallery(); };
                pageNumbers.appendChild(span);
            }

            prevBtn.style.opacity = currentPage === 1 ? '0.3' : '1';
            prevBtn.style.pointerEvents = currentPage === 1 ? 'none' : 'auto';
            nextBtn.style.opacity = currentPage === totalPages ? '0.3' : '1';
            nextBtn.style.pointerEvents = currentPage === totalPages ? 'none' : 'auto';
        }

        filterBtns.forEach(btn => {
            btn.onclick = function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-filter');
                currentPage = 1; 
                renderGallery();
            };
        });

        if (filterSelect) {
            filterSelect.addEventListener('change', function() {
                currentCategory = this.value;
                currentPage = 1;
                renderGallery();
            });
        }

        prevBtn.onclick = function() { if (currentPage > 1) { currentPage--; renderGallery(); } };
        nextBtn.onclick = function() {
            const totalPages = Math.ceil(totalDetectedImages / itemsPerPage);
            if (currentPage < totalPages) { currentPage++; renderGallery(); }
        };
    }

    // =========================================
    // 4. LOGIKA KONTAK (KIRIM WA)
    // =========================================
    const formWA = document.getElementById('form-wa');
    if (formWA) {
        formWA.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const nama = document.getElementById('nama').value;
            const produk = document.getElementById('produk').value;
            const jumlah = document.getElementById('jumlah').value;
            const pesan = document.getElementById('pesan').value;
            const noWA = "628112539312"; 
            const teksPesan = `Halo Tim MAJASTE, saya ingin berkonsultasi.%0A%0A*Nama:* ${nama}%0A*Jenis Produk:* ${produk}%0A*Jumlah:* ${jumlah}%0A*Pesan:* ${pesan}`;
            const urlWA = `https://wa.me/${noWA}?text=${teksPesan}`;
            window.open(urlWA, '_blank');
        });
    }

    // =========================================
    // 5. LOGIKA LIGHTBOX / POP-UP (PORTFOLIO & FLOWCHART)
    // =========================================
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeModal = document.querySelector(".close-modal");

    function openModal(src) {
        if(modal && modalImg) {
            modal.style.display = "flex";
            modalImg.src = src;
        }
    }

    if(closeModal) {
        closeModal.onclick = function() { modal.style.display = "none"; }
    }
    if(modal) {
        modal.onclick = function(e) {
            if (e.target !== modalImg) modal.style.display = "none"; 
        }
    }

    // --- FLOWCHART LIGHTBOX ---
    // Cari semua gambar di dalam .image-flow-wrapper (Cara Order)
    const flowchartImgs = document.querySelectorAll('.image-flow-wrapper img');
    flowchartImgs.forEach(img => {
        img.style.cursor = 'zoom-in'; // Ubah kursor jadi kaca pembesar
        img.addEventListener('click', function() {
            openModal(this.src);
        });
    });

    // --- TABEL UKURAN & HARGA (BUKA TAB BARU) ---
    // Cari semua gambar di dalam .gambar-tabel-wrapper (Ukuran & Harga)
    const tableImgs = document.querySelectorAll('.gambar-tabel-wrapper img');
    tableImgs.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            window.open(this.src, '_blank'); // Buka di tab baru
        });
    });

});