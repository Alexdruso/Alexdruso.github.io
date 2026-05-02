---
title: Projects | Alessandro Sanvito
layout: page
permalink: /projects/
---

<div class="projects">
  <p class="projects-header">
    Selected GitHub projects — coursework from Politecnico di Milano and KTH, two ACM RecSys Challenge entries, and a hackathon.
    Full list on
    <a href="https://github.com/Alexdruso" target="_blank" rel="noopener">GitHub</a>.
  </p>

  {% assign projects = site.data.projects | sort: "year" | reverse %}
  {% for project in projects %}
    <article class="project-card">
      <div class="project-meta">
        <span class="project-year">{{ project.year }}</span>
        {% if project.role %}<span class="role-chip">{{ project.role }}</span>{% endif %}
      </div>

      <h2 class="project-title">
        <a href="{{ project.repo }}" target="_blank" rel="noopener">{{ project.title }}</a>
      </h2>

      {% if project.context %}<p class="project-context">{{ project.context }}</p>{% endif %}

      <p class="project-description">{{ project.description }}</p>

      {% if project.tags %}
        <p class="project-tags">
          {% for tag in project.tags %}<span class="tag-chip">{{ tag }}</span>{% endfor %}
        </p>
      {% endif %}

      <p class="project-links">
        <a href="{{ project.repo }}" target="_blank" rel="noopener"><i class="fab fa-github"></i> View on GitHub</a>
      </p>
    </article>
  {% endfor %}
</div>
