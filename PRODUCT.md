# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Job seekers in Georgia who search, filter and read vacancies, keep a profile with an avatar and a PDF CV, and apply (applications are not built yet).
- Employers (companies) in Georgia who register, wait for admin approval, keep a company profile with a logo, and publish and manage vacancies.
- Admins who approve or revoke companies and approve or reject vacancies.

The interface is English only for now.

## Product Purpose

DreamJob is a job vacancy search site. Companies publish vacancies; people find them quickly and trust what they see. Success means a seeker can go from search to a credible, complete vacancy in a few seconds, and an employer can publish without friction once approved.

## Positioning

- Verified employers: every company is approved by an admin before it can publish, and every vacancy is reviewed before it goes public.
- Salary transparency: salary ranges are shown up front, and the list can be filtered and sorted by pay.
- Fast, focused search: search, filters and a clean list, nothing noisy.

## Operating Context

- Backend: the DreamJob NestJS API (separate repo), JWT auth, accounts for users and companies with separate routes and the same flows (sign-up with email code, first password, sign-in, Google sign-in, forgot and reset password, email change).
- Vacancy statuses: pending, published, rejected, closed, and derived expired.
- Currencies: GEL, USD, EUR. Employment types: full-time, part-time, internship, temporary. Work modes: remote, onsite, hybrid.

## Capabilities and Constraints

- Not built yet in the backend, so not in the UI: applications, saved jobs, payments (employer plans), chatbot.
- Public company profile fields are undecided in the backend; vacancy responses currently carry only the company id.
- The JWT lives in localStorage, so pages behind login render on the client. Public vacancy pages render on the server.

## Brand Commitments

Only the name DreamJob is fixed. No logo, palette, fonts or voice exist yet; the design direction was delegated.

## Evidence on Hand

No real customers, testimonials, statistics or company logos exist. Never fabricate job counts, employer names or reviews.

## Product Principles

1. Trust is the product: verification and review states are always visible and honest.
2. Pay up front: salary is first-class information wherever a vacancy appears.
3. Speed over spectacle: every screen gets the seeker to the next decision fast.
4. One flow, two account types: users and companies share patterns so neither feels second-class.
