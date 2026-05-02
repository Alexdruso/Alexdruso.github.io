---
title: Publications | Alessandro Sanvito
layout: page
permalink: /publications/
---

<div class="publications">
  <p class="publications-header">
    Peer-reviewed work in computer vision (ICCV, IEEE IV) and recommender systems (ACM RecSys Challenge).
    Full list and citation counts on
    <a href="https://scholar.google.com/citations?user=l2MkTYkAAAAJ&hl=en" target="_blank" rel="noopener">Google Scholar</a>.
  </p>

  {% assign pubs = site.data.publications | sort: "year" | reverse %}
  {% for pub in pubs %}
    <article class="publication-card">
      <div class="publication-meta">
        <span class="venue-badge venue-{{ pub.tier }}" title="{{ pub.venue_full }}">{{ pub.venue }}</span>
        <span class="publication-year">{{ pub.year }}</span>
        {% if pub.first_author %}<span class="first-author-chip">First author</span>{% endif %}
      </div>

      <h2 class="publication-title">
        {% if pub.arxiv %}
          <a href="{{ pub.arxiv }}" target="_blank" rel="noopener">{{ pub.title }}</a>
        {% else %}
          {{ pub.title }}
        {% endif %}
      </h2>

      <p class="publication-authors">
        {% for author in pub.authors %}{% if author contains "Sanvito" %}<strong>{{ author }}</strong>{% else %}{{ author }}{% endif %}{% unless forloop.last %}, {% endunless %}{% endfor %}
      </p>

      <p class="publication-tldr">{{ pub.tldr }}</p>

      {% if pub.arxiv %}
        <p class="publication-links">
          <a href="{{ pub.arxiv }}" target="_blank" rel="noopener"><i class="fas fa-file-pdf"></i> arXiv</a>
        </p>
      {% endif %}
    </article>
  {% endfor %}
</div>
