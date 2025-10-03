// Logo Test Automation Script
// Garcia Builder - Logo Validation Test Suite

class LogoTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        this.pages = [
            'index.html',
            'about.html',
            'contact.html',
            'testimonials.html',
            'transformations.html',
            'pricing.html',
            'faq.html',
            'login.html',
            'dashboard.html',
            'my-profile.html',
            'programs.html',
            'reset-password.html'
        ];
    }

    // Test 1: Check if logo files exist
    async testLogoFileExists() {
        console.log('🧪 Testing logo file existence...');
        const logoPath = 'Logo Files/For Web/logo-nobackground-500.png';
        
        try {
            const response = await fetch(logoPath);
            if (response.ok) {
                this.logPass('Logo file exists and is accessible');
                return true;
            } else {
                this.logFail(`Logo file not found: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.logFail(`Error accessing logo file: ${error.message}`);
            return false;
        }
    }

    // Test 2: Check CSS classes for transparent background
    testCSSTransparency() {
        console.log('🧪 Testing CSS transparency...');
        
        // Create test elements
        const testContainer = document.createElement('div');
        testContainer.style.position = 'absolute';
        testContainer.style.top = '-9999px';
        testContainer.innerHTML = `
            <img class="brand-test" style="height:48px;width:48px;border-radius:16px;box-shadow:0 2px 12px #0005;object-fit:contain;background:transparent;">
            <img class="footer-test" style="height:38px;width:38px;border-radius:12px;box-shadow:0 1px 6px #0003;background:transparent;object-fit:contain;">
        `;
        document.body.appendChild(testContainer);

        const brandImg = testContainer.querySelector('.brand-test');
        const footerImg = testContainer.querySelector('.footer-test');

        // Check computed styles
        const brandStyle = window.getComputedStyle(brandImg);
        const footerStyle = window.getComputedStyle(footerImg);

        let passed = true;

        if (brandStyle.background === 'rgba(0, 0, 0, 0)' || brandStyle.background === 'transparent') {
            this.logPass('Brand logo background is transparent');
        } else {
            this.logFail(`Brand logo background is not transparent: ${brandStyle.background}`);
            passed = false;
        }

        if (footerStyle.background === 'rgba(0, 0, 0, 0)' || footerStyle.background === 'transparent') {
            this.logPass('Footer logo background is transparent');
        } else {
            this.logFail(`Footer logo background is not transparent: ${footerStyle.background}`);
            passed = false;
        }

        // Cleanup
        document.body.removeChild(testContainer);
        
        return passed;
    }

    // Test 3: Check for old logo references
    testOldLogoReferences() {
        console.log('🧪 Testing for old logo references...');
        
        const pageContent = document.documentElement.innerHTML;
        const oldReferences = [
            'assets/logo.png',
            'logo files/For Web',  // lowercase
            'background: #fff',
            'background:#fff'
        ];

        let foundOldRefs = [];
        
        oldReferences.forEach(ref => {
            if (pageContent.includes(ref)) {
                foundOldRefs.push(ref);
            }
        });

        if (foundOldRefs.length === 0) {
            this.logPass('No old logo references found');
            return true;
        } else {
            foundOldRefs.forEach(ref => {
                this.logFail(`Found old reference: ${ref}`);
            });
            return false;
        }
    }

    // Test 4: Check logo loading performance
    async testLogoLoadingPerformance() {
        console.log('🧪 Testing logo loading performance...');
        
        const logoImages = document.querySelectorAll('img[src*="logo-nobackground-500.png"]');
        const loadPromises = [];

        logoImages.forEach((img, index) => {
            const startTime = performance.now();
            
            const loadPromise = new Promise((resolve) => {
                if (img.complete) {
                    const loadTime = performance.now() - startTime;
                    resolve({ index, loadTime, status: 'already-loaded' });
                } else {
                    img.addEventListener('load', () => {
                        const loadTime = performance.now() - startTime;
                        resolve({ index, loadTime, status: 'loaded' });
                    });
                    
                    img.addEventListener('error', () => {
                        const loadTime = performance.now() - startTime;
                        resolve({ index, loadTime, status: 'error' });
                    });
                }
            });
            
            loadPromises.push(loadPromise);
        });

        const results = await Promise.all(loadPromises);
        let allPassed = true;

        results.forEach(result => {
            if (result.status === 'error') {
                this.logFail(`Logo ${result.index + 1} failed to load`);
                allPassed = false;
            } else if (result.loadTime > 1000) {
                this.logFail(`Logo ${result.index + 1} took too long to load: ${result.loadTime.toFixed(2)}ms`);
                allPassed = false;
            } else {
                this.logPass(`Logo ${result.index + 1} loaded in ${result.loadTime.toFixed(2)}ms`);
            }
        });

        return allPassed;
    }

    // Test 5: Visual consistency check
    testVisualConsistency() {
        console.log('🧪 Testing visual consistency...');
        
        const logoImages = document.querySelectorAll('img[src*="logo-nobackground-500.png"]');
        const navbarLogos = document.querySelectorAll('.navbar img[src*="logo-nobackground-500.png"], .brand img[src*="logo-nobackground-500.png"]');
        const footerLogos = document.querySelectorAll('.footer img[src*="logo-nobackground-500.png"]');

        let passed = true;

        // Check navbar logos (should be ~48px)
        navbarLogos.forEach((img, index) => {
            const computedStyle = window.getComputedStyle(img);
            const height = parseInt(computedStyle.height);
            
            if (height >= 40 && height <= 60) {
                this.logPass(`Navbar logo ${index + 1} has correct size: ${height}px`);
            } else {
                this.logFail(`Navbar logo ${index + 1} has incorrect size: ${height}px (expected 40-60px)`);
                passed = false;
            }
        });

        // Check footer logos (should be ~38px)
        footerLogos.forEach((img, index) => {
            const computedStyle = window.getComputedStyle(img);
            const height = parseInt(computedStyle.height);
            
            if (height >= 30 && height <= 45) {
                this.logPass(`Footer logo ${index + 1} has correct size: ${height}px`);
            } else {
                this.logFail(`Footer logo ${index + 1} has incorrect size: ${height}px (expected 30-45px)`);
                passed = false;
            }
        });

        return passed;
    }

    // Utility methods
    logPass(message) {
        console.log(`✅ PASS: ${message}`);
        this.results.passed++;
        this.results.tests.push({ status: 'PASS', message });
    }

    logFail(message) {
        console.error(`❌ FAIL: ${message}`);
        this.results.failed++;
        this.results.tests.push({ status: 'FAIL', message });
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Garcia Builder Logo Test Suite...');
        console.log('================================================');

        const tests = [
            { name: 'Logo File Existence', method: () => this.testLogoFileExists() },
            { name: 'CSS Transparency', method: () => this.testCSSTransparency() },
            { name: 'Old Logo References', method: () => this.testOldLogoReferences() },
            { name: 'Loading Performance', method: () => this.testLogoLoadingPerformance() },
            { name: 'Visual Consistency', method: () => this.testVisualConsistency() }
        ];

        for (const test of tests) {
            console.log(`\n📋 Running: ${test.name}`);
            try {
                await test.method();
            } catch (error) {
                this.logFail(`Test "${test.name}" threw an error: ${error.message}`);
            }
        }

        this.generateReport();
    }

    // Generate test report
    generateReport() {
        console.log('\n📊 TEST RESULTS SUMMARY');
        console.log('================================================');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Total: ${this.results.passed + this.results.failed}`);
        console.log(`📊 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

        if (this.results.failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Logo implementation is perfect! 🎉');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the issues above.');
        }

        // Display results in DOM if test page is loaded
        this.displayResultsInDOM();
    }

    displayResultsInDOM() {
        const existingReport = document.getElementById('test-results');
        if (existingReport) {
            existingReport.remove();
        }

        const reportDiv = document.createElement('div');
        reportDiv.id = 'test-results';
        reportDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px;
            border-radius: 12px;
            max-width: 400px;
            z-index: 10000;
            border: 2px solid ${this.results.failed === 0 ? '#28a745' : '#dc3545'};
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `;

        const successRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
        
        reportDiv.innerHTML = `
            <h5 style="margin: 0 0 15px 0; color: ${this.results.failed === 0 ? '#28a745' : '#dc3545'};">
                ${this.results.failed === 0 ? '🎉' : '⚠️'} Test Results
            </h5>
            <div style="margin-bottom: 10px;">
                <strong>✅ Passed:</strong> ${this.results.passed}<br>
                <strong>❌ Failed:</strong> ${this.results.failed}<br>
                <strong>📊 Success Rate:</strong> ${successRate}%
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
            ">Close</button>
        `;

        document.body.appendChild(reportDiv);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (reportDiv.parentElement) {
                reportDiv.remove();
            }
        }, 10000);
    }
}

// Auto-run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all resources to load
    setTimeout(() => {
        const logoTestSuite = new LogoTestSuite();
        logoTestSuite.runAllTests();
    }, 1000);
});

// Export for manual testing
window.LogoTestSuite = LogoTestSuite;