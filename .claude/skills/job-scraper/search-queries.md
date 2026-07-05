# Search Queries for Job Scraper

<!-- Customized for Christopher Gillis: US-based (Tampa, FL), remote-first,
     Senior/Staff full-stack + platform + AI-agent engineering. -->

## Search Sites / Tools

Christopher is US-based and remote-first, so the search uses **country-agnostic** tools rather than the Danish portals:

- **LinkedIn** - use the `linkedin-search` skill (filter: Remote (United States); secondary: Tampa, FL / Tampa Bay).
- **Ashby** - use the `ashby-search` skill to search a named company's Ashby-hosted job board.
- **Greenhouse** - use the `greenhouse-search` skill to search a named company's Greenhouse-hosted job board.
- **Google `site:` searches** - for company career pages and boards not covered above (Lever, Workday, etc.).

Many AI startups run their careers on Ashby or Greenhouse, so monitor target companies directly with those two skills in addition to the broad LinkedIn sweep.

## Target Companies to Monitor (Ashby / Greenhouse / careers pages)

AI / agent platforms and dev-tooling companies worth checking directly:
- Anthropic, OpenAI, Perplexity, Hugging Face, LangChain, Cohere
- Vercel, Supabase, Replit, Zapier, Retool
- (add more as you identify them; these often post on Ashby or Greenhouse)

## Query Categories

Queries are grouped by priority. For LinkedIn, add the location filter **Remote (United States)** (and optionally **Tampa, FL**). For Ashby/Greenhouse, run the role-title terms against each target company's board.

### Priority 1: Senior / Staff Full-Stack & Platform Engineer

Strongest and most desired direction.

```
linkedin-search "Senior Software Engineer" remote united states
linkedin-search "Senior Full Stack Engineer" remote united states
linkedin-search "Staff Software Engineer" remote united states
linkedin-search "Staff Engineer" platform remote united states
```

### Priority 2: AI / Agent / Platform Engineering

Matches his current, most differentiated experience (AI agents, MCP, AI-assisted workflows).

```
linkedin-search "AI Engineer" remote united states
linkedin-search "Software Engineer" "AI agents" remote
linkedin-search "Platform Engineer" LLM OR agents remote united states
ashby-search <company> "engineer" AI
greenhouse-search <company> "software engineer" AI
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
greenhouse-search <company> "senior software engineer"
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
