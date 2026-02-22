---
title: "Golden set + evals: The Foundation of Reliable LLM Tests"
date: 2026-02-22
excerpt: It's time to connect non-determinism and evaluations into a process that makes sense. Learn how to build and use a Golden Set in AI testing.
draft: false
lang: en
tags: ["LLM", "QA", "Evals", "Golden Set"]
---

In the [first part](/en/blog/ach-ta-niedeterministycznosc/) we talked about how LLMs are non-deterministic. In the [second](/en/blog/evals-co-wlasciwie-oceniamy/) - that classic "pass/fail" doesn't work and we must evaluate different aspects of responses (evals).

In the third, it's time to connect this into a process that answers the most important question in QA: **"How do I know if the system actually works better after a prompt or model change?"**

The answer is the duo: golden set + evals. And don't worry - if you've worked mainly with API or mobile testing so far, transitioning to the AI world isn't that difficult.

## What is a golden set?

A golden set is a set of prompts and reference, human-approved answers that serve as a benchmark (ground truth) when testing a model. Think of them as the "golden rules" of test cases.

However, in the LLM world, the expected result is not a rigid frame, but a collection of information:

- **A reference answer** that shows the ideal tone and structure.
- **An expert comment** explaining why this answer is good.
- **Quality criteria (evals)** that allow measuring the degree of task completion.

You can think of this as "scaling expert knowledge". You decide once what success sounds like, and automation guards it for you with every subsequent change.

## Why do we need a golden set if answers can vary?

Because different answers can also be good. A golden set doesn't pretend to be deterministic. It does something much more important: **it sets the boundaries of acceptability**.

1. **Defines success**: It's your "Expected Result", but in a flexible version. It sets the standard you expect from the system.
2. **Enables evaluation by comparison (Reference-based)**: This is a key concept. Whoever evaluates (a human or, in the future, another AI model) doesn't check the text 1:1. They use your reference as a semantic guidepost. They know the answer should contain the same facts and tone as the reference, even if it uses different words.
3. **Protects against regression**: This is your main safeguard. When you update a model or change a prompt, the Golden Set immediately tells you: "warning, factual quality has dropped". Without this, you're flying blind.

It's a bit like a photo ID: each of us looks slightly different every day, but we are still the same person. The golden set tells us: "this is still an acceptable answer".

## What makes a good golden set?

Ideally, each example in a golden set contains four key elements:

### 1. Prompt

That is, what the user will type. Not "pretty prompt engineering", but real input: short, skewed, ambiguous, poorly formulated, and sometimes absurd.

A golden set should reflect real user behaviors - and users don't write perfect prompts. (Neither do I).

### 2. Expected good answer (golden answer)

This doesn't have to be the only right text. It can be:

- a reference answer defined by a human,
- a few examples of equivalent answers,
- an outline + comment ("the answer should contain A, B, avoid C").

### 3. Evaluation according to evals categories

Here's where the magic happens. A golden set is not just a collection of answers, but also their evaluation according to [evals categories](/en/blog/evals-co-wlasciwie-oceniamy/):

- **Fidelity** (does it perform the task),
- **Relevance** (does it stick to the topic),
- **Safety** (is it safe),
- **Tone** (does it sound right),
- **Context** (does it use context).

The golden answer always has a high score - it's our benchmark.

### 4. QA Comments

The most important element that many people forget about. A good golden set includes notes:

- why this answer is correct,
- what would be a mistake,
- where the tolerance limits are (e.g. "can be phrased differently, but must contain X").

This describes the "QA intent", which later helps in automation.

## How does a golden set work with evals?

Simply put: A golden set is your "exam paper" (questions and correct answers). Evals is the "grading key" (rules by which you check this exam).

In modern QA, we forget about simple text comparison. Instead, we implement a process:

1. You give the model a prompt from the golden set.
2. The model generates an answer.
3. **The evaluator (person or system) gets your "golden answer" as a reference.**
4. **Whoever checks the result doesn't count commas.** They check if the intent and facts match your reference.

This is why reference-based evaluations are so effective - they allow keeping the flexibility of AI without losing control over quality.

## How to build a golden set step by step?

### Step 1: Collect real cases

Don't invent - observe: user reports, chat logs, incorrect model answers, edge-cases. This is the most valuable source of knowledge.

### Step 2: Rewrite them into a "prompt -> answer" format

Ensure that the answer is high quality, complete, doesn't hallucinate, and complies with safety policies. Remember: the golden answer should be better than a typical model answer.

### Step 3: Evaluate it according to evals

Assign a score (e.g., Fidelity: 5, Relevance: 5, Safety: 5, Tone: 4) and save it in the golden set.

### Step 4: Add an explanatory comment

E.g.: "The answer is correct because it contains X, Y, and Z. Acceptable versions: shortened or expanded, provided the factual content is maintained."

### Step 5: Perform model tests on the golden set

This is already your pipeline:

1. Model generates an answer.
2. **Evaluator** (you or an automated system) checks the answer according to your evals.
3. We compare the results with goals defined in the golden set.
4. We report the quality.

In the upcoming parts of this series, I'll show you how to harness another model (**LLM-as-a-judge**) to completely automate this process. But the foundation is always your Golden Set.

### What does such a process look like in practice?

- **PROMPT** -> **MODEL** -> **ANSWER**
- **EVALS** (Your evaluation criteria)
- **COMPARISON** with GOLDEN SET (reference + tolerance)
- **TEST RESULT**

The end result? You don't get an "expected output mismatch" message, but a concrete conclusion: "Model 1.4 dropped in Fidelity from 4.8 to 3.1". These are tests that make sense.

## Example of a simple golden case

**Prompt:**
"Give 3 advantages of automated tests."

**Golden answer (reference benchmark):**

1. Fast feedback in the CI/CD process (shorter regression cycles).
2. Higher repeatability and elimination of human errors in boring tasks.
3. Lowering bug detection costs thanks to shifting tests "to the left" (Shift Left).

**Evaluation criteria (Evals):**

- **Fidelity**: Were exactly 3 advantages given?
- **Relevance**: Do the advantages actually relate to automated tests?
- **Tone**: Is the answer professional and factual?

**QA Comment (Expertise Capture):**
"We want to emphasize the business impact (Shift Left, regression). If the model gives 'saving tester's time', it is acceptable but scored lower than 'shortening time-to-market'. Forbidden: statements that automated tests replace exploratory testing or prolong the development process (oh, the horror)."

## Goldens aren't for the model to learn by heart

A common mistake is treating a golden set as a training dataset. A golden set is a QA tool, not ML (Machine Learning).

It should be:

- small (50-300 cases),
- well described,
- stable,
- manually crafted.

It's used for testing, not training.

## When does a golden set fail?

1. When it's too small - you only test the "happy path".
2. When it's artificial - you invent things real users don't ask about.
3. When there are no evals - then it's just a set of "pretty answers" that can't be measured.
4. When you don't update it - the model evolves, and your references stay in the past.

A golden set is a living organism.

## QA Checklist for this post

- Does your Golden Set serve to detect **factual regression**, and not just formatting errors?
- Do you provide the judge with a **reference answer** so they can perform reference-based evaluation?
- Did you record the **business intent** in QA comments, and not just "correct text"?
- Does your set contain **edge-cases** (short, wrong, malicious prompts)?
- Is the Golden Set separated from data used for model fine-tuning?

## Summary

A golden set is QA's way to bring order to a world where the answer is never identical, and there are more risks than in classic APIs. Combined with evals, it gives stable tests, repeatable evaluations, and real QA impact on the quality of LLM-based systems.

It's the foundation of practical AI testing. Time to get to work and start building your own "golden library".

Talk to you in the next episode of the series! 👋
