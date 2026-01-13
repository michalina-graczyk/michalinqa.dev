---
title: "From Cypress to Playwright - Saleor's Voyage"
date: 2024-03-15
excerpt: "This is the story of Saleor's path from our early days of automated testing, to adapting to new tools, and finally to where we stand today with a more robust and efficient testing framework."
tags: ["testing", "playwright", "cypress", "automation"]
draft: false
---

This is the story of Saleor's path from our early days of automated testing, to adapting to new tools, and finally to where we stand today with a more robust and efficient testing framework.

Saleor recently migrated our end-to-end test suite from Cypress to Playwright. In this article we share our journey, the challenges we encountered, and how the transition unfolded.

## How it started

Let's take a trip back to 2020. It's the beginning of the pandemic and I'm diving into adding the first storefront end-to-end tests written in Cypress. Back then, we didn't have a CI/CD setup - GitHub history shows that our deployment workflow was established in 2021.

## Why we decided to migrate

After years of using Cypress, we started noticing limitations that were becoming harder to work around. The test suite was growing, and we needed:

- Better parallel execution support
- Multi-browser testing capabilities
- Improved debugging tools
- Better TypeScript integration

## The migration process

The migration wasn't a simple find-and-replace. We had to:

1. Learn Playwright's API and best practices
2. Rewrite our custom commands and utilities
3. Update our CI/CD pipelines
4. Train the team on the new framework

## Results

After the migration, we saw significant improvements:

- **50% faster test execution** thanks to better parallelization
- **Reduced flakiness** due to Playwright's auto-waiting mechanisms
- **Better debugging** with trace viewer and video recording
- **Improved developer experience** with better TypeScript support

## Lessons learned

Every migration is an opportunity to improve not just the tools, but also the practices. We took this chance to:

- Review and refactor our test architecture
- Establish better naming conventions
- Create comprehensive documentation
- Set up proper test data management

The journey from Cypress to Playwright was challenging but ultimately rewarding. If you're considering a similar migration, start small, involve the whole team, and don't be afraid to question existing patterns.
