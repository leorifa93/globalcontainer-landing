// Internationalization system for GlobalContainer landing page
class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.getUrlLanguage() || this.detectLanguage();
        this.translations = {};
        this.loadTranslations();
    }

    // Detect user's preferred language from browser
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        // Map browser language to our supported languages
        const supportedLanguages = ['de', 'en', 'fr', 'ln'];
        if (supportedLanguages.includes(langCode)) {
            return langCode;
        }
        
        // Default to German if no match
        return 'de';
    }

    // Get stored language from localStorage
    getStoredLanguage() {
        return localStorage.getItem('globalcontainer-language');
    }

    // Get language from URL parameter
    getUrlLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang');
        const supportedLanguages = ['de', 'en', 'fr', 'ln'];
        return supportedLanguages.includes(lang) ? lang : null;
    }

    // Store language preference
    storeLanguage(lang) {
        localStorage.setItem('globalcontainer-language', lang);
    }

    // Load translation files
    async loadTranslations() {
        try {
            const response = await fetch(`translations/${this.currentLanguage}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.applyTranslations();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to German if loading fails
            if (this.currentLanguage !== 'de') {
                this.currentLanguage = 'de';
                await this.loadTranslations();
            }
        }
    }

    // Apply translations to the page
    applyTranslations() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;

        // Update meta title and description
        if (this.translations.meta) {
            document.title = this.translations.meta.title;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.content = this.translations.meta.description;
            }
        }

        // Translate all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Translate elements with data-i18n-html attribute (for HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.getTranslation(key);
            if (translation) {
                element.innerHTML = translation;
            }
        });

        // Update language switcher active state
        this.updateLanguageSwitcher();
        
        // Update legal page links
        this.updateLegalLinks();
    }

    // Get translation by key (supports nested keys like 'hero.title')
    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations;
        
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return typeof translation === 'string' ? translation : null;
    }

    // Change language
    async changeLanguage(lang) {
        if (lang === this.currentLanguage) return;
        
        console.log('Changing language to:', lang);
        this.currentLanguage = lang;
        this.storeLanguage(lang);
        
        try {
            await this.loadTranslations();
            this.updateURL(lang);
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    }

    // Update URL with language parameter
    updateURL(lang) {
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
    }

    // Update language switcher active state
    updateLanguageSwitcher() {
        const switchers = document.querySelectorAll('.language-switcher, .mobile-language-switcher');
        switchers.forEach(switcher => {
            const buttons = switcher.querySelectorAll('.lang-btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.lang === this.currentLanguage) {
                    btn.classList.add('active');
                }
            });
        });
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get language name for display
    getLanguageName(lang) {
        const names = {
            'de': 'Deutsch',
            'en': 'English',
            'fr': 'Français',
            'ln': 'Lingala'
        };
        return names[lang] || lang;
    }

    // Update legal page links based on current language
    updateLegalLinks() {
        const legalLinks = document.querySelectorAll('.legal-link');
        legalLinks.forEach(link => {
            const legalType = link.getAttribute('data-legal');
            const lang = this.currentLanguage;
            
            // Map legal types to file names
            const fileMap = {
                'terms': {
                    'de': 'agb.html',
                    'en': 'terms-en.html',
                    'fr': 'terms-fr.html',
                    'ln': 'terms-ln.html'
                },
                'privacy': {
                    'de': 'datenschutz.html',
                    'en': 'privacy-en.html',
                    'fr': 'privacy-fr.html',
                    'ln': 'privacy-ln.html'
                },
                'imprint': {
                    'de': 'impressum.html',
                    'en': 'imprint-en.html',
                    'fr': 'imprint-fr.html',
                    'ln': 'imprint-ln.html'
                }
            };
            
            if (fileMap[legalType] && fileMap[legalType][lang]) {
                link.href = fileMap[legalType][lang];
            }
        });
    }
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing i18n...');
    window.i18n = new I18n();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
