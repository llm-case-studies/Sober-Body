# Feature Proposal: Terminology Decks for Scalable Multilingual Drill-Based Language Learning

## Overview

This document outlines a feature proposal for integrating structured, leveled terminology decks into a multilingual language learning application. The goal is to allow all UI and instructional language to be presented in the learner's **target language**, while remaining understandable and scaffolded across three learner difficulty levels: **beginner**, **intermediate**, and **advanced**.

By teaching learners how to interpret the app's instructions through short, targeted "setup drills," the system eliminates the need for per-source-language translations, improves immersion, and creates a highly scalable structure.

---

## Key Concepts

### 1. **Target-Language UI (TLUI)**

All interface and drill content is presented in the target language (e.g., Portuguese for a learner of PT-BR), including:

- Exercise instructions
- Button labels
- Feedback and corrections

This approach favors immersion and long-term retention.

### 2. **Staging Vocabulary / Terminology Decks**

A terminology deck is a curated set of core words and phrases used to stage or interact with drills. These are grouped into three levels:

- **Beginner** – Basic navigation and feedback vocabulary
- **Intermediate** – Contextual and instructional language
- **Advanced** – Grammatical/meta-linguistic terminology and refined feedback

### 3. **Setup Drills**

To introduce new learners to the TLUI model, 3–5 short interactive drills are presented at the beginning. These setup drills:

- Teach staging vocabulary through use and repetition
- Establish meaning for essential commands (e.g., "Verificar", "Frente")
- Build learner confidence before full immersion

### 4. **UI-Vocab Dictionary for Hints (Optional)**

A small JSON-based mapping dictionary allows optional display of tooltips or translations for UI terms if the learner chooses. This is optional and non-blocking.

---

## Data Structure

### Suggested Vocabulary Deck JSON Schema

```json
{
  "beginner": {
    "frente": { "en": "front", "es": "frente", "fr": "recto" },
    "verificar": { "en": "check", "es": "verificar", "fr": "vérifier" },
    "tente novamente": { "en": "try again", "es": "intenta de nuevo", "fr": "essaie encore" }
  },
  "intermediate": {
    "corrigir": { "en": "correct (a mistake)", "es": "corregir", "fr": "corriger" },
    "contexto": { "en": "context", "es": "contexto", "fr": "contexte" },
    "escolha": { "en": "choose", "es": "elige", "fr": "choisis" }
  },
  "advanced": {
    "subjuntivo": { "en": "subjunctive", "es": "subjuntivo", "fr": "subjonctif" },
    "sintaxe": { "en": "syntax", "es": "sintaxis", "fr": "syntaxe" },
    "ambíguo": { "en": "ambiguous", "es": "ambiguo", "fr": "ambigu" }
  }
}
```

Alternate structure:

- Use separate files per level: `pt-BR.beginner.json`, `pt-BR.intermediate.json`, etc.

---

## Example Terms per Level (PT-BR)

### Beginner

| Term             | Meaning (EN)  |
| ---------------- | ------------- |
| frente           | front         |
| verso            | back          |
| verificar        | check         |
| certo            | correct/right |
| errado           | wrong         |
| tentar novamente | try again     |
| iniciar          | start         |
| próximo          | next          |

### Intermediate

| Term             | Meaning (EN)   |
| ---------------- | -------------- |
| corrigir         | correct/fix    |
| contexto         | context        |
| escolha          | choice/select  |
| resposta correta | correct answer |
| revisar          | review         |
| completar        | complete       |

### Advanced

| Term               | Meaning (EN)         |
| ------------------ | -------------------- |
| subjuntivo         | subjunctive (mood)   |
| sintaxe            | syntax               |
| ambíguo            | ambiguous            |
| tempo verbal       | verb tense           |
| forma reflexiva    | reflexive form       |
| construção passiva | passive construction |

---

## Benefits

- **Scalability:** Adds only a single small translation file per target language.
- **Consistency:** Learners become familiar with recurring interface phrases.
- **Adaptivity:** Can dynamically change based on learner level.
- **Offline/Low-cost:** No need for runtime translation APIs.

---

## Next Steps

1. Finalize schema preferences with dev team
2. Implement prototype of setup drills for PT-BR
3. Seed beginner/intermediate/advanced decks for 1–2 other languages (e.g., ES, FR)
4. Add optional tooltips using ui\_vocab mappings

---

Let me know if you’d like me to generate JSON seed files for any specific target languages.

