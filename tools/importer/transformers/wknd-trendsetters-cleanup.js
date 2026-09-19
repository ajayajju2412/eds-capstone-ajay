/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters site-wide cleanup.
 *
 * Removes non-authorable global chrome so the import contains only page-level
 * authorable content. Header (navbar) and footer are global EDS blocks that are
 * already migrated, so they are stripped from every page's content here.
 *
 * All selectors verified against migration-work/cleaned.html and the per-template
 * snapshots in migration-work/templates/*//*cleaned.html:
 *   - <a class="skip-link">Skip to main content</a>   (body-level skip link)
 *   - <div class="navbar"> ... </div>                  (site header / mega menu)
 *   - <footer class="footer inverse-footer"> ... </footer>
 *
 * NOTE: the hero section inside #main-content uses a <header class="section ...">
 * tag and IS authorable content, so bare `header` is deliberately NOT removed.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (header/footer are already-migrated global blocks).
    WebImporter.DOMUtils.remove(element, [
      '.skip-link',
      '.navbar',
      'footer.footer',
      'footer',
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Strip framework-injected attributes (Astro scoped-style hooks) — noise, not authorable.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-astro')) el.removeAttribute(attr.name);
      });
    });
  }
}
