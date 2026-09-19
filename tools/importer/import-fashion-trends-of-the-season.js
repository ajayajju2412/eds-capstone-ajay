/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import tabsParser from './parsers/tabs.js';
import articleListParser from './parsers/article-list.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  "name": "fashion-trends-of-the-season",
  "description": "To be named in naming step",
  "urls": [
    "https://wknd-trendsetters.site/",
    "https://wknd-trendsetters.site/fashion-trends-of-the-season",
    "https://wknd-trendsetters.site/fashion-trends-young-adults"
  ],
  "blocks": [
    {
      "name": "hero",
      "instances": [
        "#main-content > header.section.secondary-section",
        ".section.inverse-section"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "#main-content > section.section:nth-of-type(1)"
      ]
    },
    {
      "name": "cards",
      "instances": [
        "#main-content > section.section.secondary-section:nth-of-type(2)"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".tabs-wrapper",
        "[role=tablist]"
      ]
    },
    {
      "name": "article-list",
      "instances": [
        "#main-content > section.section.secondary-section:nth-of-type(4)"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        "#main-content > section.section:nth-of-type(5)"
      ]
    }
  ],
  "sections": [
    {
      "id": "s0",
      "name": "hero-intro",
      "selector": [
        "#main-content > header.section.secondary-section"
      ],
      "style": null,
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    },
    {
      "id": "s1",
      "name": "featured-teaser",
      "selector": [
        "#main-content > section.section:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "snapshot-gallery",
      "selector": [
        "#main-content > section.section.secondary-section:nth-of-type(2)"
      ],
      "style": "secondary",
      "blocks": [
        "cards"
      ],
      "defaultContent": [
        "h2",
        "p"
      ]
    },
    {
      "id": "s3",
      "name": "testimonial-tabs",
      "selector": [
        "#main-content > section.section:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "tabs"
      ],
      "defaultContent": []
    },
    {
      "id": "s4",
      "name": "latest-articles",
      "selector": [
        "#main-content > section.section.secondary-section:nth-of-type(4)"
      ],
      "style": "secondary",
      "blocks": [
        "article-list"
      ],
      "defaultContent": [
        "h2",
        "p"
      ]
    },
    {
      "id": "s5",
      "name": "faq",
      "selector": [
        "#main-content > section.section:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [
        "accordion"
      ],
      "defaultContent": [
        "h2",
        "p"
      ]
    },
    {
      "id": "s6",
      "name": "cta-banner",
      "selector": [
        "#main-content > section.section.inverse-section"
      ],
      "style": "dark",
      "blocks": [
        "hero"
      ],
      "defaultContent": []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'tabs': tabsParser,
  'article-list': articleListParser,
  'accordion': accordionParser
};

// TRANSFORMER REGISTRY (sections transformer only when 2+ sections)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
