# Software Requirements Specification (SRS): Simple Pokédex App

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for the **Simple Pokédex** application, a web-based tool designed to replicate the official Pokemon.com Pokédex experience. It allows users to search for Pokémon, view high-quality artwork, and analyze technical data like abilities and type effectiveness.

### 1.2 Scope

The application is a client-side web app built with React/Next.js. It integrates with the PokéAPI to provide real-time data and uses a custom-built calculation engine for battle mechanics (weaknesses/resistances).

---

## 2. System Overview

### 2.1 Core Features

- **Dynamic Autocomplete:** A search bar that suggests Pokémon names as the user types.
- **Official Layout:** A dark-themed interface matching the official Pokédex styling.
- **Type Multiplier Engine:** Automated calculation of damage multipliers (4x, 2x, 0.5x, 0.25x, 0x).
- **Ability Insight:** Interactive English descriptions for Pokémon abilities via modal windows.

---

## 3. Functional Requirements

### 3.1 Search & Selection (FR)

- **FR-1: Global Cache:** On initial load, the app shall fetch a list of all 1000+ Pokémon names/IDs to ensure the autocomplete is instant.
- **FR-2: Search Logic:** The search bar shall filter the cached list and display results in a dropdown.
- **FR-3: Data Fetching:** Selecting a Pokémon triggers a multi-stage fetch:
  1.  Base data (ID, name, official artwork, types, abilities).
  2.  Type data (damage relations for all current types).
  3.  Ability data (descriptions).

### 3.2 Display Requirements

- **FR-4: Official Artwork:** The app must display the high-resolution sprite from `sprites.other['official-artwork']`.
- **FR-5: ID Formatting:** National Dex numbers must be displayed with leading zeros (e.g., `#001` instead of `1`).

### 3.3 Type Effectiveness Logic

- **FR-6: Multiplier Calculation:** The app must manually calculate the effectiveness of all 18 types against the selected Pokémon.
  - _Calculation:_ (Multiplier Type A) × (Multiplier Type B).
- **FR-7: Filtered Results:** To match the official UI, the app should prioritize displaying "Weaknesses" (types with a multiplier > 1).

### 3.4 Interactive Elements

- **FR-8: Ability Popups:** Clicking an ability name shall trigger a modal.
- **FR-9: Language Filtering:** The app must parse the PokéAPI response to find and display only the English (`en`) description.

---

## 4. UI/UX & Styling Requirements

### 4.1 Visual Design

- **Background:** Primary background color `#F0ECEC` (Light Off-White).
- **Sprite Container:** Light gray rounded box (`#F2F2F2`).
- **Type Badges:** Pill-shaped badges with text and specific background colors (e.g., Grass: `#78C850`, Fire: `#F08030`).

### 4.2 Layout

- **Desktop:** Two-column grid. Left side: Image; Right side: Stats and Weakness grid.
- **Mobile:** Single-column responsive stack.

---

## 5. Technical Requirements & Deployment

### 5.1 Technology Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Data Source:** PokéAPI (REST)

### 5.2 Deployment (Vercel)

- **Host:** Vercel.
- **CI/CD:** Automatic deployment on every `git push` to the `main` branch.
- **Environment:** Production-grade Node.js runtime.

---

## 6. Non-Functional Requirements

- **Performance:** The search filter must react to keystrokes in under 100ms.
- **Accessibility:** Modal windows must be closable via the "Esc" key and an "X" button.
- **Availability:** The app should handle PokéAPI downtime gracefully by displaying an error state.
