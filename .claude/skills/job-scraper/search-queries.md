# Search Queries for Job Scraper

<!-- Customized for Christopher Gillis: US-based (Tampa, FL), remote-first,
     Senior/Staff full-stack + platform + AI-agent engineering. -->

## Search Sites / Tools

Christopher is US-based and remote-first, so the search uses **country-agnostic** tools rather than the Danish portals:

- **LinkedIn** - use the `linkedin-search` skill (filter: Remote (United States); secondary: Tampa, FL / Tampa Bay).
- **Remotive** - use the `remotive-search` skill for a broad sweep of fully-remote roles across all companies at once (global aggregator, server-side keyword search, no `--board`). Keep it low-frequency (a couple of calls per run) per Remotive's terms.
- **Ashby** - use the `ashby-search` skill to search a named company's Ashby-hosted job board.
- **Greenhouse** - use the `greenhouse-search` skill to search a named company's Greenhouse-hosted job board.
- **Lever** - use the `lever-search` skill to search a named company's Lever-hosted job board (e.g. `-b spotify`).
- **SmartRecruiters** - use the `smartrecruiters-search` skill to search a named company's SmartRecruiters board; it supports server-side keyword search (e.g. `-b Visa -q engineer`).
- **Google `site:` searches** - for company career pages and boards not covered above (Workday, etc.).

Many AI startups run their careers on Ashby, Greenhouse, or Lever, so monitor target companies directly with those ATS skills in addition to the broad LinkedIn + Remotive sweeps.

## Target Companies to Monitor (Ashby / Greenhouse / careers pages)

AI / agent platforms and dev-tooling companies worth checking directly:
- Anthropic, OpenAI, Perplexity, Hugging Face, LangChain, Cohere
- Vercel, Supabase, Replit, Zapier, Retool
- (add more as you identify them; these often post on Ashby or Greenhouse)

## Query Categories

Queries are grouped by priority. For LinkedIn, add the location filter **Remote (United States)** (and optionally **Tampa, FL**). For Remotive, run the role-title terms as a global keyword search (`-q`). For the ATS skills (Ashby / Greenhouse / Lever / SmartRecruiters), run the role-title terms against each target company's board (`-b <company>`).

### Priority 1: Senior / Staff Full-Stack & Platform Engineer

Strongest and most desired direction.

```
linkedin-search "Senior Software Engineer" remote united states
linkedin-search "Senior Full Stack Engineer" remote united states
linkedin-search "Staff Software Engineer" remote united states
linkedin-search "Staff Engineer" platform remote united states
remotive-search -q "Senior Full Stack Engineer"
remotive-search -q "Staff Software Engineer"
```

### Priority 2: AI / Agent / Platform Engineering

Matches his current, most differentiated experience (AI agents, MCP, AI-assisted workflows).

```
linkedin-search "AI Engineer" remote united states
linkedin-search "Software Engineer" "AI agents" remote
linkedin-search "Platform Engineer" LLM OR agents remote united states
remotive-search -q "AI Engineer"
remotive-search -q "software engineer agents"
ashby-search -b <company> -q "engineer" AI
greenhouse-search -b <company> -q "software engineer" AI
lever-search -b <company> -q "engineer"
smartrecruiters-search -b <company> -q "software engineer"
```

### Priority 3: Backend / Infrastructure (adjacent)

Adjacent roles that fit his backend + AWS/Terraform depth.

```
linkedin-search "Backend Engineer" Go OR TypeScript remote united states
linkedin-search "Software Engineer" "multi-tenant" OR SaaS remote
linkedin-search "Infrastructure Engineer" AWS Terraform remote united states
```

### Priority 4: Broader Software Engineering (wider net)

```
linkedin-search "Full Stack Engineer" TypeScript React remote united states
linkedin-search "Software Engineer" Java OR Go remote united states
remotive-search -q "Full Stack Engineer" --limit 50
greenhouse-search -b <company> -q "senior software engineer"
lever-search -b <company> -q "software engineer"
```

## Location Filter

When evaluating results, apply Christopher's remote-first preference:
- **Remote (US)** - IDEAL (hard preference; US Eastern time zone)
- **Hybrid within Tampa Bay area** (Tampa, St. Petersburg, Clearwater) - ACCEPTABLE
- **Hybrid/onsite elsewhere in the US** - BORDERLINE (only if remote-friendly for most of the week; no relocation)
- **Onsite requiring relocation** - TOO FAR (deal-breaker)

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape ai agents" -> Priority 2 queries + custom agent/MCP-specific queries
- "/scrape staff" -> Priority 1 Staff-level queries + custom architecture-focused queries
