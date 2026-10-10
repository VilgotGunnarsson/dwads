/*
 * Lugnhem theme – storefront interactions.
 * Progressive enhancement only: every feature has a working no-JS fallback
 * (native forms, links and <details>). No third-party dependencies.
 *
 * Analytics hooks: the theme dispatches DOM CustomEvents (e.g. `theme:cart:added`)
 * on `document`. Nothing is tracked or sent anywhere by the theme itself; connect
 * these events to an analytics tool only after consent handling is configured.
 */
(() => {
  'use strict';

  const theme = window.theme || { routes: {}, strings: {} };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const emit = (name, detail = {}) => document.dispatchEvent(new CustomEvent(`theme:${name}`, { detail }));

  const announce = (message) => {
    const region = $('[data-live-region]');
    if (!region) return;
    region.textContent = '';
    window.setTimeout(() => {
      region.textContent = message;
    }, 50);
  };

  const debounce = (fn, wait = 300) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  };

  const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

  /* ------------------------------------------------------------------ */
  /* Dialogs (menu drawer, search, cart drawer)                          */
  /* ------------------------------------------------------------------ */
  const Dialogs = {
    lastTrigger: null,

    open(dialog, trigger) {
      if (!dialog || dialog.open) return;
      this.lastTrigger = trigger || document.activeElement;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      const autofocus = $('input[type="search"]', dialog);
      if (autofocus) autofocus.focus();
    },

    close(dialog) {
      if (!dialog || !dialog.open) return;
      dialog.close();
    },

    init() {
      document.addEventListener('click', (event) => {
        const opener = event.target.closest('[data-drawer-open]');
        if (opener) {
          const dialog = document.getElementById(opener.dataset.drawerOpen);
          if (dialog && typeof dialog.showModal === 'function') {
            event.preventDefault();
            this.open(dialog, opener);
          }
          return;
        }
        const closer = event.target.closest('[data-drawer-close]');
        if (closer) {
          this.close(closer.closest('dialog'));
        }
      });

      $$('dialog').forEach((dialog) => {
        // Click on the backdrop closes the dialog.
        dialog.addEventListener('click', (event) => {
          if (event.target === dialog) this.close(dialog);
        });
        dialog.addEventListener('close', () => {
          document.documentElement.style.overflow = '';
          $$('[aria-expanded="true"][data-drawer-open], [aria-expanded="true"][data-cart-open]').forEach((el) =>
            el.setAttribute('aria-expanded', 'false')
          );
          if (this.lastTrigger && document.body.contains(this.lastTrigger)) this.lastTrigger.focus();
        });
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Cart                                                                */
  /* ------------------------------------------------------------------ */
  const Cart = {
    get drawer() {
      return document.getElementById('CartDrawer');
    },

    sectionIds() {
      const ids = [];
      if (this.drawer) ids.push('cart-drawer');
      const page = $('[data-cart-page]');
      if (page) ids.push(page.dataset.sectionId);
      return ids;
    },

    open(trigger) {
      if (theme.cartType !== 'drawer' || !this.drawer) {
        window.location.href = theme.routes.cart;
        return;
      }
      Dialogs.open(this.drawer, trigger);
    },

    async request(url, body) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.status) {
        const error = new Error(data.description || data.message || theme.strings.error);
        error.data = data;
        throw error;
      }
      return data;
    },

    render(sections) {
      if (!sections) return;
      if (sections['cart-drawer'] && this.drawer) {
        const fresh = parseHTML(sections['cart-drawer']).querySelector('[data-cart-drawer-inner]');
        const current = $('[data-cart-drawer-inner]', this.drawer);
        if (fresh && current) current.replaceWith(fresh);
      }
      const page = $('[data-cart-page]');
      if (page && sections[page.dataset.sectionId]) {
        const fresh = parseHTML(sections[page.dataset.sectionId]).querySelector('[data-cart-page-inner]');
        const current = $('[data-cart-page-inner]', page);
        if (fresh && current) current.replaceWith(fresh);
      }
      const source = $('[data-cart-drawer-inner]') || $('[data-cart-page-inner]');
      if (source) this.updateCount(Number(source.dataset.cartCountValue || 0));
    },

    updateCount(count) {
      $$('[data-cart-count]').forEach((badge) => {
        badge.classList.toggle('is-empty', count === 0);
        const visible = badge.querySelector('[aria-hidden]');
        if (visible) visible.textContent = count;
      });
    },

    showError(message) {
      const target = $('[data-cart-error]', this.drawer?.open ? this.drawer : document);
      if (!target) return announce(message);
      target.textContent = message;
      target.hidden = false;
    },

    async changeLine(line, quantity, lineElement) {
      if (lineElement) lineElement.classList.add('is-updating');
      try {
        const data = await this.request(theme.routes.cartChange, {
          line: Number(line),
          quantity: Number(quantity),
          sections: this.sectionIds(),
          sections_url: window.location.pathname,
        });
        this.render(data.sections);
        announce(theme.strings.cartUpdated);
        emit('cart:updated', { cart: data });
      } catch (error) {
        if (lineElement) lineElement.classList.remove('is-updating');
        this.showError(error.message || theme.strings.error);
      }
    },

    async add(form, button) {
      const errorEl = $('[data-form-error]', form);
      if (errorEl) errorEl.hidden = true;
      button?.classList.add('is-loading');
      button?.setAttribute('aria-busy', 'true');

      const formData = new FormData(form);
      const payload = {
        items: [{ id: Number(formData.get('id')), quantity: Number(formData.get('quantity') || 1) }],
        sections: this.sectionIds(),
        sections_url: window.location.pathname,
      };

      try {
        const data = await this.request(theme.routes.cartAdd, payload);
        if (theme.cartType !== 'drawer' || !this.drawer) {
          window.location.href = theme.routes.cart;
          return;
        }
        this.render(data.sections);
        announce(theme.strings.addedToCart);
        emit('cart:added', { items: data.items });
        this.open(button);
      } catch (error) {
        const message = error.message || theme.strings.error;
        if (errorEl) {
          errorEl.textContent = message;
          errorEl.hidden = false;
        } else {
          announce(message);
        }
      } finally {
        button?.classList.remove('is-loading');
        button?.removeAttribute('aria-busy');
      }
    },

    init() {
      document.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-cart-open]');
        if (toggle && theme.cartType === 'drawer' && this.drawer) {
          event.preventDefault();
          this.open(toggle);
          return;
        }

        const remove = event.target.closest('[data-line-remove]');
        if (remove) {
          event.preventDefault();
          this.changeLine(remove.dataset.lineRemove, 0, remove.closest('.cart-line'));
          return;
        }

        const qtyButton = event.target.closest('[data-qty-minus], [data-qty-plus]');
        if (qtyButton) {
          const wrapper = qtyButton.closest('[data-qty]');
          const input = $('input', wrapper);
          if (!input) return;
          const step = Number(input.step) || 1;
          const min = input.min !== '' ? Number(input.min) : 0;
          const max = input.max !== '' ? Number(input.max) : Infinity;
          const current = Number(input.value) || 0;
          const next = qtyButton.hasAttribute('data-qty-plus') ? current + step : current - step;
          input.value = Math.min(max, Math.max(min, next));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      const onQtyChange = debounce((input) => {
        const line = input.dataset.lineQty;
        if (!line) return;
        this.changeLine(line, Math.max(0, Number(input.value) || 0), input.closest('.cart-line'));
      }, 350);

      document.addEventListener('change', (event) => {
        const input = event.target.closest('[data-line-qty]');
        if (input) onQtyChange(input);

        const note = event.target.closest('[data-cart-note]');
        if (note) {
          this.request(theme.routes.cartUpdate, { note: note.value }).catch(() => {});
        }
      });

      // Cart forms submit on Enter should not trigger checkout accidentally.
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.matches('[data-line-qty]')) {
          event.preventDefault();
          event.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Product form & variant picker                                      */
  /* ------------------------------------------------------------------ */
  const Product = {
    init() {
      document.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-product-form]');
        if (!form) return;
        if (!window.fetch) return;
        event.preventDefault();
        const button = $('[data-add-to-cart]', form);
        if (button?.disabled) return;
        Cart.add(form, button);
      });

      $$('[data-product-section]').forEach((section) => this.setupSection(section));
    },

    setupSection(section) {
      const variantsEl = $('[data-variants]', section);
      const picker = $('[data-variant-picker]', section);
      let variants = [];
      try {
        variants = JSON.parse(variantsEl?.textContent || '[]');
      } catch (error) {
        variants = [];
      }

      if (picker && variants.length) {
        picker.addEventListener('change', (event) => {
          const input = event.target.closest('input[type="radio"]');
          if (!input) return;
          const label = $(`[data-option-value="${input.dataset.optionIndex}"]`, picker);
          if (label) label.textContent = input.value;
          const selected = $$('input[type="radio"]:checked', picker).map((el) => el.value);
          const variant = variants.find((v) => v.options.every((opt, i) => opt === selected[i]));
          this.updateVariant(section, variant);
        });
      }

      this.setupGallery(section);
    },

    updateVariant(section, variant) {
      const idInput = $('[data-variant-id]', section);
      const button = $('[data-add-to-cart]', section);
      const buttonText = $('[data-add-to-cart-text]', section);
      const availability = $('[data-availability]', section);
      const availabilityText = $('[data-availability-text]', section);
      const price = $('[data-product-price]', section);

      if (!variant) {
        if (button) button.disabled = true;
        if (buttonText) buttonText.textContent = theme.strings.unavailable;
        if (availabilityText) availabilityText.textContent = theme.strings.unavailable;
        availability?.querySelector('.status-dot')?.classList.remove('is-available');
        return;
      }

      if (idInput) idInput.value = variant.id;
      if (price && variant.priceHtml) price.innerHTML = variant.priceHtml;
      if (button) button.disabled = !variant.available;
      if (buttonText) buttonText.textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;
      if (availabilityText) availabilityText.textContent = variant.available ? theme.strings.available : theme.strings.soldOut;
      availability?.querySelector('.status-dot')?.classList.toggle('is-available', variant.available);

      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());

      if (variant.media) this.showMedia(section, variant.media);
      emit('variant:changed', { variant });
    },

    showMedia(section, mediaId) {
      const list = $('[data-gallery-list]', section);
      const item = list && $(`[data-media-id="${mediaId}"]`, list);
      if (!item) return;
      const isSlider = window.matchMedia('(max-width: 989px)').matches;
      if (isSlider) {
        list.scrollTo({ left: item.offsetLeft - list.offsetLeft, behavior: 'smooth' });
      } else if (list.firstElementChild !== item) {
        list.prepend(item);
      }
    },

    setupGallery(section) {
      const list = $('[data-gallery-list]', section);
      const counter = $('[data-gallery-current]', section);
      if (!list || !counter || !('IntersectionObserver' in window)) return;
      const items = $$('.gallery__item', list);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) counter.textContent = items.indexOf(entry.target) + 1;
          });
        },
        { root: list, threshold: 0.6 }
      );
      items.forEach((item) => observer.observe(item));
    },
  };

  /* ------------------------------------------------------------------ */
  /* Predictive search                                                   */
  /* ------------------------------------------------------------------ */
  const PredictiveSearch = {
    controller: null,

    init() {
      const input = $('[data-predictive-search-input]');
      const results = $('[data-predictive-search-results]');
      const status = $('[data-predictive-search-status]');
      if (!input || !results) return;

      const search = debounce(async () => {
        const term = input.value.trim();
        if (term.length < 2) {
          results.innerHTML = '';
          input.setAttribute('aria-expanded', 'false');
          return;
        }
        this.controller?.abort();
        this.controller = new AbortController();
        if (status) status.textContent = theme.strings.searchLoading;
        try {
          const params = new URLSearchParams({
            q: term,
            section_id: 'predictive-search',
            'resources[type]': 'product,collection,page,query',
            'resources[limit]': '6',
            'resources[options][fields]': 'title,product_type,variants.title,tag',
          });
          const response = await fetch(`${theme.routes.predictiveSearch}?${params}`, {
            signal: this.controller.signal,
          });
          if (!response.ok) throw new Error(response.statusText);
          const html = await response.text();
          const fresh = parseHTML(html).querySelector('.predictive-search__results');
          results.innerHTML = fresh ? fresh.outerHTML : '';
          input.setAttribute('aria-expanded', fresh ? 'true' : 'false');
          if (status) {
            const empty = $('.predictive-search__empty', results);
            const count = fresh?.dataset.resultCount || '0';
            status.textContent = empty
              ? empty.textContent
              : (theme.strings.searchResults || '[count]').replace('[count]', count);
          }
        } catch (error) {
          if (error.name !== 'AbortError') results.innerHTML = '';
        }
      }, 250);

      input.addEventListener('input', search);

      // Arrow-key navigation through results.
      input.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
        const options = $$('[role="option"]', results);
        if (!options.length) return;
        event.preventDefault();
        const currentIndex = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
        options.forEach((o) => o.setAttribute('aria-selected', 'false'));
        let next = event.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
        if (next < 0) next = options.length - 1;
        if (next >= options.length) next = 0;
        options[next].setAttribute('aria-selected', 'true');
        input.setAttribute('aria-activedescendant', options[next].id);
        options[next].scrollIntoView({ block: 'nearest' });
      });

      input.closest('form')?.addEventListener('submit', (event) => {
        const selected = $('[role="option"][aria-selected="true"] a', results);
        if (selected) {
          event.preventDefault();
          window.location.href = selected.href;
        }
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Collection / search filters                                         */
  /* ------------------------------------------------------------------ */
  const Facets = {
    init() {
      $$('[data-facets-form]').forEach((form) => {
        const submit = debounce(() => {
          const params = new URLSearchParams(new FormData(form));
          // Drop empty price inputs so they don't create empty filters.
          for (const [key, value] of Array.from(params.entries())) {
            if (value === '') params.delete(key);
          }
          window.location.href = `${form.action}?${params.toString()}`;
        }, 500);

        form.addEventListener('change', (event) => {
          if (event.target.matches('[data-facets-sort], input[type="checkbox"]')) submit();
        });
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          submit();
        });
      });

      // Close the filter panel on Escape or outside click.
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        $$('details[data-facets-drawer][open], details[data-auto-close][open]').forEach((d) => {
          d.removeAttribute('open');
          $('summary', d)?.focus();
        });
      });
      document.addEventListener('click', (event) => {
        $$('details[data-facets-drawer][open], details[data-auto-close][open]').forEach((d) => {
          if (!d.contains(event.target)) d.removeAttribute('open');
        });
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Product recommendations (lazy)                                     */
  /* ------------------------------------------------------------------ */
  const Recommendations = {
    async load(container) {
      const fetchInto = async (url) => {
        const response = await fetch(url);
        if (!response.ok) return false;
        const fresh = parseHTML(await response.text()).querySelector('[data-recommendations]');
        if (fresh && fresh.querySelector('.product-grid li')) {
          container.innerHTML = fresh.innerHTML;
          return true;
        }
        return false;
      };
      try {
        const ok = await fetchInto(container.dataset.url);
        if (!ok && container.dataset.fallbackUrl && container.dataset.fallbackUrl !== container.dataset.url) {
          await fetchInto(container.dataset.fallbackUrl);
        }
      } catch (error) {
        /* Recommendations are optional – fail silently. */
      }
    },

    init() {
      $$('[data-recommendations]').forEach((container) => {
        if (container.children.length) return;
        if (!('IntersectionObserver' in window)) {
          this.load(container);
          return;
        }
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              observer.disconnect();
              this.load(container);
            }
          },
          { rootMargin: '400px 0px' }
        );
        observer.observe(container);
      });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Safety checklist (stored only in this browser)                      */
  /* ------------------------------------------------------------------ */
  const Checklist = {
    storage: {
      get(key) {
        try {
          return JSON.parse(window.localStorage.getItem(key) || '{}');
        } catch (error) {
          return {};
        }
      },
      set(key, value) {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          /* Storage unavailable (private mode) – checklist still works for this visit. */
        }
      },
    },

    init() {
      $$('[data-checklist]').forEach((root) => {
        const key = `checklist:${root.dataset.checklist}`;
        const boxes = $$('[data-checklist-item]', root);
        const progress = $('[data-checklist-progress]', root);
        const reset = $('[data-checklist-reset]', root);
        const state = this.storage.get(key);

        const update = () => {
          const done = boxes.filter((b) => b.checked).length;
          if (progress) {
            progress.hidden = false;
            progress.textContent = (theme.strings.checklistProgress || '[done] / [total]')
              .replace('[done]', done)
              .replace('[total]', boxes.length);
          }
          if (reset) reset.hidden = done === 0;
        };

        boxes.forEach((box) => {
          box.checked = Boolean(state[box.dataset.checklistItem]);
          box.addEventListener('change', () => {
            state[box.dataset.checklistItem] = box.checked;
            this.storage.set(key, state);
            update();
          });
        });

        reset?.addEventListener('click', () => {
          boxes.forEach((box) => {
            box.checked = false;
            state[box.dataset.checklistItem] = false;
          });
          this.storage.set(key, state);
          update();
        });

        update();
      });
    },
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-print]')) window.print();
  });

  /* ------------------------------------------------------------------ */
  /* Privacy preferences link (only when Shopify's banner is active)     */
  /* ------------------------------------------------------------------ */
  const Privacy = {
    init() {
      const item = $('[data-privacy-preferences]');
      if (!item) return;
      const reveal = () => {
        if (window.privacyBanner && typeof window.privacyBanner.showPreferences === 'function') {
          item.hidden = false;
          $('button', item)?.addEventListener('click', () => window.privacyBanner.showPreferences());
          return true;
        }
        return false;
      };
      if (!reveal()) window.addEventListener('load', () => window.setTimeout(reveal, 1500), { once: true });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Analytics-friendly click hooks (no tracking performed here)         */
  /* ------------------------------------------------------------------ */
  document.addEventListener('click', (event) => {
    const tracked = event.target.closest('[data-track]');
    if (tracked) emit('cta:click', { id: tracked.dataset.track, href: tracked.getAttribute('href') });
  });

  const start = () => {
    Dialogs.init();
    Cart.init();
    Product.init();
    PredictiveSearch.init();
    Facets.init();
    Recommendations.init();
    Checklist.init();
    Privacy.init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Theme editor: re-initialise product sections when they are reloaded.
  document.addEventListener('shopify:section:load', (event) => {
    $$('[data-product-section]', event.target).forEach((section) => Product.setupSection(section));
    Recommendations.init();
    Checklist.init();
  });
})();
