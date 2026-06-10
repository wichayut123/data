document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('surveyForm');
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const stepDots = Array.from(document.querySelectorAll('.step-dot'));
    const progressBar = document.getElementById('progressBar');
    
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    
    // Inputs & Custom controls
    const fullnameInput = document.getElementById('fullname');
    const nicknameInput = document.getElementById('nickname');
    const birthdateInput = document.getElementById('birthdate');
    const ageBadgeWrapper = document.getElementById('ageBadgeWrapper');
    const calculatedAgeSpan = document.getElementById('calculatedAge');
    
    const genderHidden = document.getElementById('gender');
    const genderCards = document.querySelectorAll('.gender-card');
    
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const socialInput = document.getElementById('social');
    const addressInput = document.getElementById('address');
    
    const hobbiesHidden = document.getElementById('hobbies');
    const hobbyTags = document.querySelectorAll('.hobby-tag');
    const contactMethodSelect = document.getElementById('contactMethod');
    const bioTextarea = document.getElementById('bio');
    
    // Config Sheet API
    const apiUrlInput = document.getElementById('apiUrlInput');
    const apiUrlStatus = document.getElementById('apiUrlStatus');
    const sheetApiUrlHidden = document.getElementById('sheetApiUrl');
    
    // Overlays & Success Screen
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successScreen = document.getElementById('successScreen');
    const successName = document.getElementById('successName');
    const successDest = document.getElementById('successDest');
    const btnDownloadJson = document.getElementById('btnDownloadJson');
    const btnReset = document.getElementById('btnReset');
    
    // State Variables
    let currentStep = 1;
    let selectedHobbies = [];
    let submittedData = null;

    // Initialize progress bar width
    updateProgressBar();

    /* ==========================================================================
       Interactive Custom Components Logic
       ========================================================================== */
    
    // Gender Card Selector
    genderCards.forEach(card => {
        card.addEventListener('click', () => {
            genderCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const genderValue = card.getAttribute('data-gender');
            genderHidden.value = genderValue;
            
            // Clear validation error if any
            clearError(genderHidden);
        });
    });

    // Hobbies Multi-select Tags
    hobbyTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const hobby = tag.getAttribute('data-hobby');
            if (selectedHobbies.includes(hobby)) {
                selectedHobbies = selectedHobbies.filter(h => h !== hobby);
                tag.classList.remove('selected');
            } else {
                selectedHobbies.push(hobby);
                tag.classList.add('selected');
            }
            
            hobbiesHidden.value = selectedHobbies.join(', ');
            
            // Clear validation error if any
            if (selectedHobbies.length > 0) {
                clearError(hobbiesHidden);
            }
        });
    });

    // Auto calculate age from date of birth
    birthdateInput.addEventListener('change', () => {
        const birthDateVal = birthdateInput.value;
        if (!birthDateVal) {
            ageBadgeWrapper.style.display = 'none';
            return;
        }

        const today = new Date();
        const birthDate = new Date(birthDateVal);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age >= 0 && age < 120) {
            calculatedAgeSpan.textContent = age;
            ageBadgeWrapper.style.display = 'inline-flex';
            clearError(birthdateInput);
        } else {
            ageBadgeWrapper.style.display = 'none';
        }
    });

    // Custom Form-Group input monitoring to clean error states
    const formInputs = form.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                clearError(input);
            }
        });
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', () => {
                if (input.value !== '') {
                    clearError(input);
                }
            });
        }
    });

    // Phone input restriction (numbers only)
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Google Sheets API URL Configuration
    apiUrlInput.addEventListener('input', () => {
        const val = apiUrlInput.value.trim();
        const sheetUrlPattern = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/;
        
        if (sheetUrlPattern.test(val)) {
            sheetApiUrlHidden.value = val;
            apiUrlStatus.className = 'config-status-badge active';
            apiUrlStatus.querySelector('.status-text').textContent = 'เชื่อมต่อ Google Sheets API แล้ว (โหมดใช้งานจริง)';
        } else if (val === '') {
            sheetApiUrlHidden.value = '';
            apiUrlStatus.className = 'config-status-badge inactive';
            apiUrlStatus.querySelector('.status-text').textContent = 'โหมดสาธิต (บันทึกจำลองลงในเบราว์เซอร์)';
        } else {
            sheetApiUrlHidden.value = '';
            apiUrlStatus.className = 'config-status-badge inactive';
            apiUrlStatus.querySelector('.status-text').textContent = 'รูปแบบ URL ไม่ถูกต้อง (ยังเป็นโหมดสาธิต)';
        }
    });

    /* ==========================================================================
       Multi-step Form Navigation & Validation
       ========================================================================== */
    
    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < 4) {
                // If moving to step 4, generate summary values
                if (currentStep === 3) {
                    generateSummary();
                }
                
                // Transition steps
                changeStep(currentStep + 1);
            } else {
                // Final submission
                submitForm();
            }
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            changeStep(currentStep - 1);
        }
    });

    function changeStep(targetStep) {
        // Hide current step, show target step
        const currentPane = document.getElementById(`step${currentStep}`);
        const targetPane = document.getElementById(`step${targetStep}`);
        
        currentPane.classList.remove('active');
        targetPane.classList.add('active');
        
        // Update steps indicators classes
        stepDots.forEach((dot, index) => {
            const stepNum = index + 1;
            dot.classList.remove('active', 'completed');
            
            if (stepNum === targetStep) {
                dot.classList.add('active');
            } else if (stepNum < targetStep) {
                dot.classList.add('completed');
            }
        });
        
        currentStep = targetStep;
        
        // Show/Hide Prev button
        if (currentStep === 1) {
            btnPrev.style.display = 'none';
        } else {
            btnPrev.style.display = 'inline-flex';
        }
        
        // Change text on Next/Submit button
        if (currentStep === 4) {
            btnNext.querySelector('span').textContent = 'บันทึกข้อมูล';
            btnNext.querySelector('svg').style.transform = 'rotate(-45deg)';
        } else {
            btnNext.querySelector('span').textContent = 'ถัดไป';
            btnNext.querySelector('svg').style.transform = 'none';
        }
        
        updateProgressBar();
    }

    function updateProgressBar() {
        const percent = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = `${percent}%`;
    }

    /* ==========================================================================
       Validation Functions
       ========================================================================== */
    
    function validateStep(step) {
        let isValid = true;

        if (step === 1) {
            // Validate Fullname
            if (fullnameInput.value.trim().length < 3) {
                showError(fullnameInput, 'กรุณากรอกชื่อ-นามสกุลจริงของคุณ');
                isValid = false;
            } else {
                clearError(fullnameInput);
            }

            // Validate Nickname
            if (nicknameInput.value.trim().length < 2) {
                showError(nicknameInput, 'กรุณากรอกชื่อเล่นของคุณ');
                isValid = false;
            } else {
                clearError(nicknameInput);
            }

            // Validate Birthdate & Age
            if (!birthdateInput.value) {
                showError(birthdateInput, 'กรุณาระบุวันเกิดของคุณ');
                isValid = false;
            } else {
                const age = parseInt(calculatedAgeSpan.textContent);
                if (isNaN(age) || age < 0 || age > 120) {
                    showError(birthdateInput, 'กรุณาระบุวันเกิดที่เป็นจริง');
                    isValid = false;
                } else {
                    clearError(birthdateInput);
                }
            }

            // Validate Gender selection
            if (!genderHidden.value) {
                showError(genderHidden, 'กรุณาเลือกเพศสภาพของคุณ');
                isValid = false;
            } else {
                clearError(genderHidden);
            }
        }

        else if (step === 2) {
            // Validate Email
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                showError(emailInput, 'กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง (เช่น name@example.com)');
                isValid = false;
            } else {
                clearError(emailInput);
            }

            // Validate Phone
            if (phoneInput.value.trim().length !== 10) {
                showError(phoneInput, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก (เช่น 0891234567)');
                isValid = false;
            } else {
                clearError(phoneInput);
            }

            // Validate Social link
            if (socialInput.value.trim().length < 2) {
                showError(socialInput, 'กรุณาระบุไอดีไลน์หรือช่องทางการติดต่อของคุณ');
                isValid = false;
            } else {
                clearError(socialInput);
            }

            // Validate Address
            if (addressInput.value.trim().length < 10) {
                showError(addressInput, 'กรุณากรอกที่อยู่ปัจจุบันของคุณโดยละเอียด');
                isValid = false;
            } else {
                clearError(addressInput);
            }
        }

        else if (step === 3) {
            // Validate Hobbies
            if (selectedHobbies.length === 0) {
                showError(hobbiesHidden, 'กรุณาเลือกงานอดิเรกอย่างน้อย 1 อย่าง');
                isValid = false;
            } else {
                clearError(hobbiesHidden);
            }

            // Validate Contact Method
            if (!contactMethodSelect.value) {
                showError(contactMethodSelect, 'กรุณาเลือกช่องทางในการติดต่อที่สะดวกที่สุด');
                isValid = false;
            } else {
                clearError(contactMethodSelect);
            }
        }

        return isValid;
    }

    function showError(element, message) {
        const formGroup = element.closest('.form-group');
        formGroup.classList.add('invalid');
        
        const errorMsg = formGroup.querySelector('.error-msg');
        if (errorMsg) {
            errorMsg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>${message}</span>
            `;
            errorMsg.style.display = 'inline-flex';
        }
    }

    function clearError(element) {
        const formGroup = element.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('invalid');
            const errorMsg = formGroup.querySelector('.error-msg');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
        }
    }

    /* ==========================================================================
       Summary Data Builder
       ========================================================================== */
    
    function generateSummary() {
        document.getElementById('sum-fullname').textContent = fullnameInput.value.trim();
        document.getElementById('sum-nickname').textContent = nicknameInput.value.trim();
        document.getElementById('sum-birthdate').textContent = formatDateThai(birthdateInput.value);
        document.getElementById('sum-age').textContent = calculatedAgeSpan.textContent;
        document.getElementById('sum-gender').textContent = genderHidden.value;
        
        document.getElementById('sum-email').textContent = emailInput.value.trim();
        document.getElementById('sum-phone').textContent = formatPhoneNumber(phoneInput.value.trim());
        document.getElementById('sum-social').textContent = socialInput.value.trim();
        document.getElementById('sum-address').textContent = addressInput.value.trim();
        
        // Generate summary hobbies pills
        const hobbiesContainer = document.getElementById('sum-hobbies-container');
        hobbiesContainer.innerHTML = '';
        selectedHobbies.forEach(hobby => {
            const pill = document.createElement('span');
            pill.className = 'sum-hobby-pill';
            pill.textContent = hobby;
            hobbiesContainer.appendChild(pill);
        });
        
        document.getElementById('sum-contactMethod').textContent = contactMethodSelect.value;
        
        const bioVal = bioTextarea.value.trim();
        document.getElementById('sum-bio').textContent = bioVal !== '' ? bioVal : 'ไม่ได้ระบุข้อมูล';
    }

    function formatDateThai(dateString) {
        if (!dateString) return '-';
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const date = new Date(dateString);
        return `${date.getDate()} ${months[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
    }

    function formatPhoneNumber(phone) {
        if (phone.length === 10) {
            return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
        }
        return phone;
    }

    /* ==========================================================================
       Form Submission & Integration
       ========================================================================== */
    
    function submitForm() {
        // Display Loading overlay
        loadingOverlay.classList.add('active');
        
        // Prepare Data Payload
        const apiEndpoint = sheetApiUrlHidden.value;
        const now = new Date();
        const timestamp = now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
        
        const formData = {
            timestamp: timestamp,
            fullname: fullnameInput.value.trim(),
            nickname: nicknameInput.value.trim(),
            birthdate: birthdateInput.value,
            age: parseInt(calculatedAgeSpan.textContent),
            gender: genderHidden.value,
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            social: socialInput.value.trim(),
            address: addressInput.value.trim(),
            hobbies: selectedHobbies.join(', '),
            contactMethod: contactMethodSelect.value,
            bio: bioTextarea.value.trim()
        };
        
        submittedData = formData;

        if (apiEndpoint) {
            // Real Submission to Google Sheets Web App
            // Google Apps Script is standardly accessed with mode: 'no-cors' if it is a simple redirect
            // Or regular fetch POST if Apps Script handles CORS headers. We use fetch POST with redirect.
            
            // To make sure it doesn't fail on CORS redirect:
            // Since Apps Script web apps return redirect 302, fetch will follow it.
            // Using standard fetch with POST:
            fetch(apiEndpoint, {
                method: 'POST',
                mode: 'no-cors', // standard way to bypass CORS redirection on GAS Web App
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(() => {
                // With 'no-cors', response status is 0 (opaque response)
                // But the data is successfully sent to Google Apps Script.
                setTimeout(() => {
                    handleSuccess(formData, 'Google Sheets (จริง)');
                }, 1000);
            })
            .catch(error => {
                console.error('Submission error:', error);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบลิงก์ Google Sheets API ของคุณอีกครั้ง');
                loadingOverlay.classList.remove('active');
            });

        } else {
            // Simulation Demo Mode
            setTimeout(() => {
                // Save to browser LocalStorage for reference
                const storedSubmissions = JSON.parse(localStorage.getItem('personal_surveys') || '[]');
                storedSubmissions.push(formData);
                localStorage.setItem('personal_surveys', JSON.stringify(storedSubmissions));
                
                handleSuccess(formData, 'เบราว์เซอร์จำลอง (LocalStorage)');
            }, 1800);
        }
    }

    function handleSuccess(data, destinationName) {
        // Set success parameters
        successName.textContent = data.fullname;
        successDest.textContent = destinationName;
        
        loadingOverlay.classList.remove('active');
        successScreen.classList.add('active');
        
        // Run confetti animation
        initConfetti();
    }

    // Download JSON backup
    btnDownloadJson.addEventListener('click', () => {
        if (!submittedData) return;
        
        const jsonString = JSON.stringify(submittedData, null, 4);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", url);
        downloadAnchor.setAttribute("download", `survey_${submittedData.fullname.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
    });

    // Reset Form to initial state
    btnReset.addEventListener('click', () => {
        // Reset HTML form
        form.reset();
        
        // Reset state variables
        selectedHobbies = [];
        submittedData = null;
        
        // Reset custom selections styling
        genderCards.forEach(c => c.classList.remove('selected'));
        hobbyTags.forEach(t => t.classList.remove('selected'));
        ageBadgeWrapper.style.display = 'none';
        
        // Reset step
        successScreen.classList.remove('active');
        changeStep(1);
    });

    /* ==========================================================================
       Canvas Confetti Logic (Vanilla JS Canvas Confetti)
       ========================================================================== */
    function initConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        
        // Resize canvas
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        window.addEventListener('resize', () => {
            if (canvas) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        });

        const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
        const confettiCount = 120;
        const confettiArr = [];

        class Confetti {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height - canvas.height;
                this.size = Math.random() * 8 + 6;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 + 2;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 4 - 2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;
                
                // Reset falling off screen
                if (this.y > canvas.height) {
                    this.y = -20;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.fillStyle = this.color;
                
                // Draw simple rectangle confetti
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        // Generate confetti objects
        for (let i = 0; i < confettiCount; i++) {
            confettiArr.push(new Confetti());
        }

        let animationFrameId;
        let animationDuration = 5000; // Stop updating after 5s to save CPU
        const startTime = Date.now();

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let timePassed = Date.now() - startTime;
            
            confettiArr.forEach(c => {
                if (timePassed < animationDuration) {
                    c.update();
                }
                c.draw();
            });

            if (successScreen.classList.contains('active')) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationFrameId);
            }
        }

        animate();
    }
});
